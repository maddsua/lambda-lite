import type { NetworkInfo } from './route.ts';
import type { MiddlewareOptions } from './options.ts';
import type { RouteHandler, RouterRoutes } from './route.ts';
import { JSONResponse } from '../rest/jsonResponse.ts';
import { ServiceConsole } from '../util/console.ts';
import { getRequestIdFromProxy, generateRequestId } from '../util/misc.ts';
import { PluginGenerator } from './plugins.ts';

interface HandlerCtx {
	expandPath?: boolean;
	plugins?: PluginGenerator[];
	handler: RouteHandler;
};

export class LambdaMiddleware {

	config: Partial<MiddlewareOptions>;
	handlersPool: Record<string, HandlerCtx>;

	constructor (routes: RouterRoutes, config?: Partial<MiddlewareOptions>) {

		this.config = config || {};

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
			};

			//	setup route plugins
			if (routeCtx.plugins || this.config.plugins) {
				const handlerPluginsSet = new Set<string>(routeCtx.plugins?.map(item => item.id));
				const applyGlobal = this.config.plugins?.filter(item => !handlerPluginsSet.has(item.id));
				handlerCtx.plugins = (applyGlobal || []).concat(routeCtx.plugins || []);
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

			const runPlugins = routectx.plugins?.map(item => item.spawn());

			//	run "before" plugins
			let pluginModifiedReqest: Request | null = null;
			let pluginBeforeResponse: Response | null = null;

			if (runPlugins?.length) {

				for (const plugin of runPlugins) {

					if (!plugin.executeBefore) continue;

					const temp = await plugin.executeBefore({
						request: pluginModifiedReqest || request,
						info: requestInfo,
						middleware: this
					});

					if (temp?.modifiedRequest) {
						pluginModifiedReqest = temp.modifiedRequest;
					}

					if (temp?.overrideResponse) {
						pluginBeforeResponse = temp.overrideResponse;
						break;
					}
				}
			}

			//	execute route function
			if (!pluginBeforeResponse) pluginBeforeResponse = await (async () => {

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

			if (runPlugins?.length) {

				for (const plugin of runPlugins) {

					if (!plugin.executeAfter) continue;

					const temp = await plugin.executeAfter({
						request: pluginModifiedReqest || request,
						response: pluginBeforeResponse,
						info: requestInfo,
						middleware: this
					});

					if (temp?.overrideResponse) {
						if (temp.chainable === false) return temp.overrideResponse;
						pluginBeforeResponse = temp.overrideResponse;
					}
				}
			}

			return pluginBeforeResponse;

		})();

		//	add some headers so the shit always works
		routeResponse.headers.set('x-powered-by', 'maddsua/lambda');
		routeResponse.headers.set('x-request-id', requestID);

		//	log for, you know, reasons
		if (this.config.loglevel?.requests !== false)	
			console.log(`(${clientIP}) ${request.method} ${requestDisplayUrl} --> ${routeResponse.status}`);

		return routeResponse;
	}
};
