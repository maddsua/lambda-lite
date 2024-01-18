import type { BasicRouter, TypedRouter } from './router.ts';
import type { NetworkInfo, Handler } from '../routes/handlers.ts';
import type { MiddlewareOptions } from './options.ts';
import type { MiddlewarePlugin } from './plugins.ts';
import { TypedResponse } from '../restapi/typedResponse.ts';
import { ServiceConsole } from '../util/console.ts';
import { getRequestIdFromProxy, generateRequestId } from '../util/misc.ts';
import { LambdaRequest } from './request.ts';
import { getResponseType } from './response.ts';

interface HandlerCtx {
	handler: Handler;
	expandPath?: boolean;
	plugins?: MiddlewarePlugin[];
};

export class LambdaMiddleware {

	config: Partial<MiddlewareOptions>;
	handlersPool: Record<string, HandlerCtx>;

	constructor (routes: BasicRouter | TypedRouter<any, any>, config?: Partial<MiddlewareOptions>) {

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
				expandPath: typeof routeCtx.expand === 'boolean' ? routeCtx.expand : routeExpandByUrl
			};

			//	setup route plugins
			if (routeCtx.plugins || this.config.plugins) {

				const handlerPluginsSet = new Set<string>(routeCtx.plugins?.map(item => item.id));
				const inheritPlugins = typeof routeCtx.inheritPlugins === 'boolean' ? routeCtx.inheritPlugins : true;

				const applyGlobal = inheritPlugins ? this.config.plugins?.filter(item => !handlerPluginsSet.has(item.id)) : undefined;
				handlerCtx.plugins = (applyGlobal || []).concat(routeCtx.plugins || []);
			}

			let applyHandlerPath = route.replace(/\/\*?$/i, '');

			if (!applyHandlerPath.length || !applyHandlerPath.startsWith('/'))
				applyHandlerPath = `/${applyHandlerPath}`;

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

	async handler (request: Request, info: NetworkInfo, context?: Object): Promise<Response> {

		const requestID = getRequestIdFromProxy(request.headers, this.config.proxy?.requestIdHeader) || generateRequestId();
		const clientIP = ((this.config.proxy?.forwardedIPHeader ? request.headers.get(this.config.proxy.forwardedIPHeader) : undefined)) || info.hostname;

		let requestDisplayUrl = '/';

		const console = new ServiceConsole(requestID);

		const invocationResponse = await (async () => {

			const { pathname } = new URL(request.url);
			requestDisplayUrl = pathname;

			let middlewareResponse: Response | null = null;

			// find route path
			const routePathname = pathname === '/' ? pathname : pathname.slice(0, pathname.endsWith('/') ? pathname.length - 1 : pathname.length);

			//	typescript is too dumb to figure it out so it might need a bin of help here
			let routectx = this.handlersPool[routePathname] as HandlerCtx | undefined;

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

			const requestInfo = Object.assign({
				clientIP,
				requestID
			}, info);

			const pluginPromises = routectx?.plugins?.map(item => item.spawn({
				console,
				info: requestInfo,
				middleware: this
			}));

			const runPlugins = pluginPromises?.length ? await Promise.all(pluginPromises) : [];

			//	run "before" plugin callbacks
			let pluginModifiedRequest: Request | null = null;

			for (const plugin of runPlugins) {
	
				if (!plugin.executeBefore) continue;

				try {

					const temp = await plugin.executeBefore(pluginModifiedRequest || request);
	
					if (temp?.respondWith) {
						middlewareResponse = temp.respondWith;
						break;
					}
	
					if (temp?.modifiedRequest) {
						pluginModifiedRequest = temp.modifiedRequest;
						if (temp?.chainable === false) break;
					}
					
				} catch (error) {
					console.error(`[Plugin error (${plugin.id})] In "before" callback:`, (error as Error | null)?.message || error);
				}
			}

			//	so the logic here is that if we successfully matched a route
			//	and none of the plugins decicded to return request early
			//	we are ok to call route handler and process it's result
			if (routectx && !middlewareResponse) {

				const requestContext = Object.assign({}, context || {}, {
					console,
					requestInfo,
				});

				try {

					const dispatchRequest = new LambdaRequest(pluginModifiedRequest || request);
					const handlerResponse = await routectx.handler(dispatchRequest, requestContext);
					const responseValueType = typeof handlerResponse;

					if (responseValueType !== 'object')
						throw new Error(`Invalid handler response: unexpected return type ${responseValueType}`);

					if (handlerResponse instanceof Response) {
						middlewareResponse = handlerResponse;
					} else if ('toResponse' in handlerResponse) {
						middlewareResponse = handlerResponse.toResponse();
					} else {

						const responseBody = handlerResponse.data ? JSON.stringify(handlerResponse.data) : null;
						const responseHeaders = new Headers(handlerResponse?.headers);

						if (handlerResponse.data) {
							responseHeaders.set('content-type', getResponseType(handlerResponse.type));
						}

						middlewareResponse = new Response(responseBody, {
							headers: responseHeaders,
							status: handlerResponse.status
						});
					}

				} catch (error) {

					console.error('Lambda middleware error:', (error as Error | null)?.message || error);

					switch (this.config.defaultResponses?.error) {

						case 'log': {
							middlewareResponse = new TypedResponse({
								error_text: 'unhandled middleware error',
								error_log: (error as Error | null)?.message || JSON.stringify(error)
							}, { status: 500 }).toResponse();
						} break;
	
						default: { 
							middlewareResponse = new TypedResponse({
								error_text: 'unhandled middleware error'
							}, { status: 500 }).toResponse();
						} break;
					}
				}

			//	but if we didn't have a route we'll get to this point
			//	where we handle 404 cases
			//	can't use just "else" here as it would override possible plugin response if a 404 occured.
			//	so we only check for absence of "middlewareResponse",
			//	which would indicate 404 and no plugin response
			} else if (!middlewareResponse) {

				middlewareResponse = (() => {

					if (pathname === '/') {
	
						switch (this.config.defaultResponses?.index) {
	
							case 'forbidden': return new TypedResponse({
								error_text: 'you\'re not really welcome here mate'
							}, { status: 403 }).toResponse();
	
							case 'info': return new TypedResponse({
								server: 'maddsua/lambda-lite',
								status: 'operational'
							}, { status: 200 }).toResponse();
	
							case 'teapot': return new TypedResponse({
								error_text: 'yo bro r u lost?'
							}, { status: 418 }).toResponse();
						
							default: return new TypedResponse({
								error_text: 'route not found'
							}, { status: 404 }).toResponse();
						}
					}

					switch (this.config.defaultResponses?.notfound) {
	
						case 'forbidden': return new TypedResponse({
							error_text: 'you\'re not really welcome here mate'
						}, { status: 403 }).toResponse();
	
						default: return new TypedResponse({
							error_text: 'route not found'
						}, { status: 404 }).toResponse();
					}

				})();
			}

			//	run "after" plugin callbacks
			for (const plugin of runPlugins) {

				if (!plugin.executeAfter) continue;

				try {

					const temp = await plugin.executeAfter(middlewareResponse);

					if (temp?.overrideResponse) {
						if (temp.chainable === false) return temp.overrideResponse;
						middlewareResponse = temp.overrideResponse;
					}

				} catch (error) {
					console.error(`[Plugin error (${plugin.id})] In "after" callback:`, (error as Error | null)?.message || error);
				}
			}

			return middlewareResponse;

		})();

		//	add some headers so the shit always works
		invocationResponse.headers.set('x-powered-by', 'maddsua/lambda');
		invocationResponse.headers.set('x-request-id', requestID);

		//	log for, you know, reasons
		if (this.config.loglevel?.requests !== false)	
			console.log(`(${clientIP}) ${request.method} ${requestDisplayUrl} --> ${invocationResponse.status}`);

		return invocationResponse;
	}
};
