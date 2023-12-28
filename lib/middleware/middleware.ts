import type { ServerRoutes, RouteHandler, MiddlewareOptions, NetworkInfo } from './middleware.types.ts';
import { JSONResponse } from '../api/jsonResponse.ts';
import { ServiceConsole } from '../util/console.ts';
import { OriginChecker } from '../accessControl/originChecker.ts';
import { RateLimiter } from '../accessControl/rateLimiter.ts';
import { MethodChecker } from '../accessControl/methodChecker.ts';
import { ServiceTokenChecker } from '../accessControl/serviceTokenChecker.ts';
import { getRequestIdFromProxy, generateRequestId } from '../util/misc.ts';

interface HandlerCtx {
	expandPath?: boolean;
	rateLimiter?: RateLimiter | null;
	originChecker?: OriginChecker | null;
	methodChecker?: MethodChecker;
	serviceTokenChecker?: ServiceTokenChecker | null;
	handler: RouteHandler;
};

export class LambdaMiddleware {

	config: Partial<MiddlewareOptions>;
	handlersPool: Record<string, HandlerCtx>;
	rateLimiter?: RateLimiter;
	originChecker?: OriginChecker;
	serviceTokenChecker?: ServiceTokenChecker;

	constructor (routes: ServerRoutes, config?: Partial<MiddlewareOptions>) {

		this.config = config || {};
		this.rateLimiter = config?.rateLimit ? new RateLimiter(config.rateLimit) : undefined;
		this.originChecker = config?.allowedOrigings?.length ? new OriginChecker(config.allowedOrigings) : undefined;
		this.serviceTokenChecker = config?.serviceToken ? new ServiceTokenChecker(config.serviceToken) : undefined;

		//	transform routes
		this.handlersPool = {};

		for (const route in routes) {

			const routeCtx = routes[route as keyof typeof routes];

			const routeExpandByUrl = route.endsWith('/*');

			//	warn about path expansion
			if (typeof routeCtx.expand === 'boolean' && routeExpandByUrl) {
				console.warn(`Route %c"${route}"%c has both expanding path and %cconfig.expand%c set, the last will be used`, 'color: yellow', 'color: inherit', 'color: yellow', 'color: inherit');
			}

			const handlerCtx: HandlerCtx = {
				handler: routeCtx.handler,
				rateLimiter: routeCtx.ratelimit === null ? null : (Object.keys(routeCtx.ratelimit || {}).length ? new RateLimiter(routeCtx.ratelimit) : undefined),
				originChecker: routeCtx.allowedOrigings === 'all' ? null : (routeCtx.allowedOrigings?.length ? new OriginChecker(routeCtx.allowedOrigings) : undefined),
				expandPath: typeof routeCtx.expand === 'boolean' ? routeCtx.expand : routeExpandByUrl,
				methodChecker: routeCtx.allowedMethods?.length ? new MethodChecker(Array.isArray(routeCtx.allowedMethods) ? routeCtx.allowedMethods : [routeCtx.allowedMethods]) : undefined,
				serviceTokenChecker: routeCtx.serviceToken === null ? null : routeCtx.serviceToken ? new ServiceTokenChecker(routeCtx.serviceToken) : undefined
			};

			const applyHandlerPath = routeExpandByUrl ? (route.slice(0, route.lastIndexOf('/')) || '/') : route;
			this.handlersPool[applyHandlerPath] = handlerCtx;
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

	async handler (request: Request, info: NetworkInfo): Promise<Response> {

		const requestID = getRequestIdFromProxy(request.headers, this.config.proxy?.requestIdHeader) || generateRequestId();
		const clientIP = ((this.config.proxy?.forwardedIPHeader ? request.headers.get(this.config.proxy.forwardedIPHeader) : undefined)) || info.hostname;

		const requestOrigin = request.headers.get('origin');
		const handleCORS = this.config.handleCORS !== false;
		let allowedOrigin: string | null = null;
		let requestDisplayUrl = '/';

		const console = new ServiceConsole(requestID);

		const routeResponse = await (async () => {

			const { pathname } = new URL(request.url);
			requestDisplayUrl = pathname;

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

				if (pathname === '/') {

					switch (this.config.defaultResponses?.index) {

						case 'forbidden': return new JSONResponse({
							error_text: 'you\'re not really welcome here mate'
						}, { status: 403 }).toResponse();

						case 'info': return new JSONResponse({
							server: 'maddsua/lambda-lite',
							status: 'operational'
						}, { status: 200 }).toResponse();

						case 'teapot': return new JSONResponse({
							error_text: '🤷‍♂️'
						}, { status: 418 }).toResponse();
					
						default: return new JSONResponse({
							error_text: 'route not found'
						}, { status: 404 }).toResponse();
					}
				}

				switch (this.config.defaultResponses?.notfound) {

					case 'forbidden': return new JSONResponse({
						error_text: 'you\'re not really welcome here mate'
					}, { status: 403 }).toResponse();

					default: return new JSONResponse({
						error_text: 'route not found'
					}, { status: 404 }).toResponse();
				}
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
				const rateCheck = useRateLimiter.check({ ip: clientIP });
				if (!rateCheck.ok) {
					console.log(`Too many requests (${rateCheck.requests}). Wait for ${rateCheck.reset}s`);
					return new JSONResponse({
						error_text: 'too many requests'
					}, { status: 429 }).toResponse();
				}
			}

			//	check service token
			const useServiceChecker = routectx.serviceTokenChecker !== null ? (routectx.serviceTokenChecker || this.serviceTokenChecker) : null;
			if (useServiceChecker) {

				const bearerHeader = request.headers.get('x-service-token') || request.headers.get('authorization');
				if (!bearerHeader) {
					return new JSONResponse({
						error_text: 'service access token is required'
					}, {
						status: 401,
						headers: {
							'WWW-Authenticate': 'Basic realm="API"'
						}
					}).toResponse();
				}

				const checkResult = await useServiceChecker.check(bearerHeader);
				if (!checkResult) {
					console.warn(`Invalid service token provided (${bearerHeader})`);
					return new JSONResponse({
						error_text: 'invalid service access token'
					}, { status: 403 }).toResponse();
				}
			}

			//	check request method
			if (routectx.methodChecker) {
				const methodAllowed = routectx.methodChecker.check(request.method);
				if (!methodAllowed) {
					console.log(`Method not allowed (${request.method})`);
					return new JSONResponse({
						error_text: 'method not allowed'
					}, { status: 405 }).toResponse();
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

			//	execute route function
			try {

				const requestInfo = Object.assign({
					clientIP,
					requestID
				}, info);

				const handlerResponse = await routectx.handler(request, { console, requestInfo });

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

				console.error('Lambda middleware error:', (error as Error | null)?.message || error);

				switch (this.config.defaultResponses?.error) {

					case 'log': return new JSONResponse({
						error_text: 'unhandled middleware error',
						error_log: (error as Error | null)?.message || JSON.stringify(error)
					}, { status: 500 }).toResponse();

					default: return new JSONResponse({
						error_text: 'unhandled middleware error'
					}, { status: 500 }).toResponse();
				}
			}

		})();

		//	add some headers so the shit always works
		routeResponse.headers.set('x-powered-by', 'maddsua/lambda-lite');
		if (allowedOrigin) routeResponse.headers.set('Access-Control-Allow-Origin', allowedOrigin);
		routeResponse.headers.set('x-request-id', requestID);

		//	log for, you know, reasons
		console.log(`(${clientIP}) ${request.method} ${requestDisplayUrl} --> ${routeResponse.status}`);

		return routeResponse;
	}
};
