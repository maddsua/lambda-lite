import type { ServerRoutes } from "./routes.ts";
import { type RouteHandler, JSONResponse } from "./api.ts";
import { OriginChecker, RateLimiter, type RateLimiterConfig } from "./accessControl.ts";
import { ServiceConsole } from "./console.ts";

const getRequestIdFromProxy = (headers: Headers, headerName: string | null | undefined) => {
	if (!headerName) return undefined;
	const header = headers.get(headerName);
	if (!header) return undefined;
	const shortid = header.slice(0, header.indexOf('-'));
	return shortid.length <= 8 ? shortid : shortid.slice(0, 8);
};

const generateRequestId = () => {
	const characters = '0123456789abcdef';
	const randomChar = () => characters.charAt(Math.floor(Math.random() * characters.length));
	return Array.apply(null, Array(8)).map(randomChar).join('');
};

export interface MiddlewareOptions {
	/**
	 * Path to the directory containing handler functions
	 */
	routesDir?: string;
	/**
	 * Proxy options. The stuff that gets passed to the application by the reverse proxy if you have one
	 */
	proxy?: {
		forwardedIPHeader?: string;
		requestIdHeader?: string;
	},
	/**
	 * Request rate limiting options
	 */
	rateLimit?: Partial<RateLimiterConfig>;
	/**
	 * Enables automatic CORS response
	 */
	handleCORS?: boolean;
	/**
	 * Set a list of allowed origings. Requests that don't match these origins will be rejected with authorization error
	 */
	allowedOrigings?: string[];
	/**
	 * Show request id in response headers
	 */
	exposeRequestID?: boolean;
	/**
	 * Enable automatic health responses on this url
	 */
	healthcheckPath?: `/${string}`;
};

interface HandlerCtx {
	expandPath?: boolean;
	rateLimiter?: RateLimiter | null;
	originChecker?: OriginChecker | null;
	handler: RouteHandler;
};

export class LambdaMiddleware {

	config: Partial<MiddlewareOptions>;
	handlersPool: Record<string, HandlerCtx>;
	rateLimiter: RateLimiter | null;
	originChecker: OriginChecker | null;

	constructor (routes: ServerRoutes, config?: Partial<MiddlewareOptions>) {

		this.config = config || {};
		this.rateLimiter = config?.rateLimit ? new RateLimiter(config.rateLimit) : null;
		this.originChecker = config?.allowedOrigings?.length ? new OriginChecker(config.allowedOrigings) : null;

		//	transform routes
		this.handlersPool = {};

		for (const route in routes) {

			const routeCtx = routes[route as keyof typeof routes];

			const handlerCtx: HandlerCtx = {
				handler: routeCtx.handler,
				rateLimiter: routeCtx.ratelimit === null ? null : (Object.keys(routeCtx.ratelimit || {}).length ? new RateLimiter(routeCtx.ratelimit) : undefined),
				originChecker: routeCtx.allowedOrigings === 'all' ? null : (routeCtx.allowedOrigings?.length ? new OriginChecker(routeCtx.allowedOrigings) : undefined),
				expandPath: routeCtx.expand || route.endsWith('/*')
			};

			//	warn about path expansion
			if (routeCtx.expand === false && handlerCtx.expandPath) {
				console.warn(`Route %c"${route}"%c has both expanding path and %cconfig.expand%c set, the last will be used`, 'color: yellow', 'color: inherit', 'color: yellow', 'color: inherit');
			}

			this.handlersPool[route] = handlerCtx;
		}

		//	setup healthcheck path
		if (this.config?.healthcheckPath) {

			if (this.handlersPool[this.config.healthcheckPath]) {
				console.warn(`%cPath collision between healthcheck path and route function%c (${this.config.healthcheckPath})`, 'color: yellow', 'color: white');
			}

			this.handlersPool[this.config.healthcheckPath] = {
				handler: () => new Response(null, { status: 200 })
			};
		}
	}

	async handler (request: Request, info: Deno.ServeHandlerInfo): Promise<Response> {

		const requestID = getRequestIdFromProxy(request.headers, this.config.proxy?.requestIdHeader) || generateRequestId();
		const requestIP = (this.config.proxy?.forwardedIPHeader ?
			request.headers.get(this.config.proxy.forwardedIPHeader) : undefined) ||
			info.remoteAddr.hostname;

		const requestOrigin = request.headers.get('origin');
		const handleCORS = this.config.handleCORS !== false;
		let allowedOrigin: string | null = null;
		let exposeRequestID = false;
		let requestDisplayUrl = '/';

		const console = new ServiceConsole(requestID);

		const routeResponse = await (async () => {

			const { pathname, search } = new URL(request.url);
			requestDisplayUrl = pathname + search;

			// find route function
			let routectx = this.handlersPool[pathname];

			// match route function
			if (!routectx) {
				const pathComponents = pathname.slice(1).split('/');
				for (let idx = pathComponents.length - 1; idx >= 0; idx--) {
	
					const nextRoute = '/' + pathComponents.slice(0, idx).join('/');
					const nextCtx = this.handlersPool[nextRoute];
	
					if (nextCtx?.expandPath) {
						routectx = nextCtx;
						break;
					}
				}
			}
	
			//	go cry in the corned if it's not found
			if (!routectx) {
				return new JSONResponse({
					error_text: 'route not found'
				}, { status: 404 }).toResponse();
			}

			//	check request origin
			const useOriginChecker = routectx.originChecker !== null ? (routectx.originChecker || this.originChecker) : null;
			if (useOriginChecker) {

				if (!requestOrigin) {
					return new JSONResponse({
						error_text: 'client not verified'
					}, { status: 403 }).toResponse();
				}
				else if (!useOriginChecker.check(requestOrigin)) {
					console.log('Origin not allowed:', requestOrigin);
					return new JSONResponse({
						error_text: 'client not verified'
					}, { status: 403 }).toResponse();
				}

				allowedOrigin = requestOrigin;
			}
			else if (requestOrigin && allowedOrigin) {
				allowedOrigin = '*';
			}

			//	check rate limiter
			const useRateLimiter = routectx.rateLimiter !== null ? (routectx.rateLimiter || this.rateLimiter) : null;
			if (useRateLimiter) {
				const rateCheck = useRateLimiter.check({ ip: requestIP });
				if (!rateCheck.ok) {
					console.log(`Too many requests (${rateCheck.requests}). Wait for ${rateCheck.reset}s`);
					return new JSONResponse({
						error_text: 'too many requests'
					}, { status: 429 }).toResponse();
				}
			}

			//	respond to CORS preflixgt
			if (request.method == 'OPTIONS' && handleCORS) {

				const requestedCorsHeaders = request.headers.get('Access-Control-Request-Headers');
				const defaultCorsHeaders = 'Origin, X-Requested-With, Content-Type, Accept';

				const requestedCorsMethod = request.headers.get('Access-Control-Request-Method');
				const defaultCorsMethods = 'GET, POST, PUT, OPTIONS, DELETE';

				return new JSONResponse(null, {
					status: 204,
					headers: {
						'Access-Control-Allow-Methods': requestedCorsMethod || defaultCorsMethods,
						'Access-Control-Allow-Headers': requestedCorsHeaders || defaultCorsHeaders,
						'Access-Control-Max-Age': '3600',
						'Access-Control-Allow-Credentials': 'true'
					}
				}).toResponse();
			}

			//	expose request id
			if (this.config.exposeRequestID) exposeRequestID = true;

			//	execute route function
			try {

				const handlerResponse = await routectx.handler(request, { console, requestID, requestIP });

				//	here we convert a non-standard response object to a standard one
				//	all non standard should provide a "toResponse" method to do that
				const responseObject = handlerResponse instanceof Response ? handlerResponse : handlerResponse.toResponse();

				//	and if after that it's still not a Response we just crash the request
				if (!(responseObject instanceof Response)) {
					const typeErrorReport = (handlerResponse && typeof handlerResponse === 'object') ?
						`object keys ({${Object.keys(handlerResponse).join(', ')}}) don't match handler response interface` :
						`variable of type "${typeof handlerResponse}" is not a valid handler response`;
					throw new Error('Invalid function response: ' + typeErrorReport);
				}

				return responseObject;

			} catch (error) {
				console.error('Lambda middleware error:', (error as Error).message || error);
				return new JSONResponse({
					error_text: 'unhandled middleware error'
				}, { status: 500 }).toResponse();
			}

		})();

		//	add some headers so the shit always works
		routeResponse.headers.set('x-powered-by', 'maddsua/lambda-lite');
		if (allowedOrigin) routeResponse.headers.set('Access-Control-Allow-Origin', allowedOrigin);
		if (exposeRequestID) routeResponse.headers.set('x-request-id', requestID);

		//	log for, you know, reasons
		console.log(`(${requestIP}) ${request.method} "${requestDisplayUrl}" --> ${routeResponse.status}`);

		return routeResponse;
	}
};
