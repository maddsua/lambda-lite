import type { NetworkInfo } from './route.ts';
import type { MiddlewareOptions } from './options.ts';
import type { RouteHandler, RouterRoutes } from './route.ts';
import { JSONResponse } from '../rest/jsonResponse.ts';
import { ServiceConsole } from '../util/console.ts';
import { getRequestIdFromProxy, generateRequestId } from '../util/misc.ts';
import { MiddlewarePlugins } from './plugins.ts';

interface HandlerCtx {
	expandPath?: boolean;
	plugins?: {
		before?: MiddlewarePlugins;
		after?: MiddlewarePlugins;
	};
	handler: RouteHandler;
};

export class LambdaMiddleware {

	config: Partial<MiddlewareOptions>;
	handlersPool: Record<string, HandlerCtx>;
	plugins?: {
		before?: MiddlewarePlugins;
		after?: MiddlewarePlugins;
	};

	constructor (routes: RouterRoutes, config?: Partial<MiddlewareOptions>) {

		this.config = config || {};

		//	transform routes
		this.handlersPool = {};

		//	setup plugins
		if (this.config.plugins) {

			this.plugins = {
				before: this.config?.plugins?.filter(item => item.sequernce === 'before'),
				after: this.config?.plugins?.filter(item => item.sequernce === 'after')
			};

			delete this.config.plugins;
		}

		for (const route in routes) {

			const routeCtx = routes[route as keyof typeof routes];

			const routeExpandByUrl = route.endsWith('/*');

			//	warn about path expansion
			if (typeof routeCtx.expand === 'boolean' && routeExpandByUrl) {
				console.warn(`Route %c"${route}"%c has both expanding path and %cconfig.expand%c set, the last will be used`, 'color: yellow', 'color: inherit', 'color: yellow', 'color: inherit');
			}

			const handlerCtx: HandlerCtx = {
				handler: routeCtx.handler,
			};

			//	setup route plugins
			if (routeCtx.plugins || this.plugins) {

				const localBefore =  routeCtx.plugins?.filter(item => item.sequernce === 'before');
				const localAfter = routeCtx.plugins?.filter(item => item.sequernce === 'after');

				const localBeforeSet = new Set<string>(localBefore?.map(item => item.instance.id));
				const localAfterSet = new Set<string>(localAfter?.map(item => item.instance.id));

				const globalBefore = localBefore?.length ? this.plugins?.before?.filter(item => !localBeforeSet.has(item.instance.id)) : this.plugins?.before;
				const globalAfter = localAfter?.length ? this.plugins?.after?.filter(item => !localAfterSet.has(item.instance.id)) : this.plugins?.after;

				handlerCtx.plugins = {
					before: (globalBefore || []).concat(localBefore || []),
					after: (globalAfter || []).concat(localAfter || []),
				};
			}

			const applyHandlerPath = route.replace(/\/\*?$/i, '');
			this.handlersPool[applyHandlerPath.length ? applyHandlerPath : '/'] = handlerCtx;
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

	async handler (request: Request, info: NetworkInfo, context?: Object): Promise<Response> {

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

			// find route path
			const routePathname = pathname.slice(0, pathname.endsWith('/') ? pathname.length - 1 : pathname.length);
			let routectx = this.handlersPool[routePathname];

			// try to find matching wildcart route path
			if (!routectx) {

				const pathComponents = routePathname.slice(1).split('/');
				for (let idx = pathComponents.length; idx >= 0; idx--) {
	
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

			const requestInfo = Object.assign({
				clientIP,
				requestID
			}, info);

			const requestContext = Object.assign({}, context || {}, {
				console,
				requestInfo,
			});

			//	run "before" plugins
			let modifiedReqest: Request | null = null;
			if (routectx.plugins?.before) {

				for (const plugin of routectx.plugins.before) {

					const temp = plugin.instance.execute({
						request,
						info: requestInfo,
						response: null,
						middleware: this
					});

					if (!temp) continue;
				}
			}

			//	execute route function
			try {

				const handlerResponse = await routectx.handler(request, requestContext);

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
		if (this.config.loglevel?.requests !== false)	
			console.log(`(${clientIP}) ${request.method} ${requestDisplayUrl} --> ${routeResponse.status}`);

		return routeResponse;
	}
};
