import type { LambdaRouter } from './router.ts';
import type { Handler, HandlerResponse } from '../routes/handlers.ts';
import type { NetworkInfo } from './context.ts';
import type { MiddlewareOptions } from './options.ts';
import type { MiddlewarePlugin } from './plugins.ts';
import { type SerializableResponse, TypedResponse } from './rest.ts';
import { ServiceConsole } from '../util/console.ts';
import { getRequestIdFromProxy, generateRequestId } from '../util/misc.ts';
import { LambdaRequest } from './rest.ts';

interface HandlerCtx {
	handler: Handler;
	expandPath?: boolean;
	plugins?: MiddlewarePlugin[];
};

export class LambdaMiddleware {

	config: Partial<MiddlewareOptions>;
	handlersPool: Record<string, HandlerCtx>;

	constructor (routes: LambdaRouter, config?: Partial<MiddlewareOptions>) {

		this.config = config || {};

		//	transform routes
		this.handlersPool = {};

		for (const route in routes) {

			const routeCtx = routes[route as keyof typeof routes];

			const routeExpandByUrl = route.endsWith('/*');

			//	warn about path expansion
			if (typeof routeCtx.expand === 'boolean' && routeExpandByUrl) {
				console.warn(`Route "${route}" has both expanding path and "config.expand" property set, the latest will be used`);
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

			if (this.handlersPool[this.config.healthcheckPath])
				throw new Error(`Path collision between healthcheck path and endpoint (${this.config.healthcheckPath})`);

			this.handlersPool[this.config.healthcheckPath] = {
				handler: () => new Response(null, { status: 200 })
			};
		}
	}

	async handler(request: Request, info: NetworkInfo, invokContext?: object): Promise<Response> {

		const getProxyRemoteIP = () => {
			const header = this.config.proxy?.forwardedIPHeader;
			if (!header?.length) return null;
			return request.headers.get(header);
		};

		const requestID = getRequestIdFromProxy(request.headers, this.config.proxy?.requestIdHeader) || generateRequestId();
		const clientIP = getProxyRemoteIP() || info.remoteAddr.hostname;

		let requestDisplayUrl = '/';

		const console = new ServiceConsole(requestID);

		//	this scary shit replaces URL object parsing
		//	and from my tests it's ~3x faster.
		//	also it won't throw shit.
		const pathname = request.url.replace(/^[^\/]+\:\/\/[^\/]+/, '').replace(/[\?\#].*$/, '') || '/';
		requestDisplayUrl = pathname;

		let middlewareResponse: Response | null = null;

		// find route path
		const routePathname = pathname.slice(0, pathname.endsWith('/') ? pathname.length - 1 : undefined) || '/';

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

		//	try getting 404 fallback handler
		if (!routectx) {
			routectx = this.handlersPool['/_404'];
		}

		const requestContext = Object.assign(invokContext || {}, {
			requestID,
			clientIP,
			console
		}, info);

		const pluginProps = Object.assign({
			middleware: this
		}, requestContext);

		const pluginPromises = routectx?.plugins?.map(item => item.spawn(pluginProps));
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

			try {

				const dispatchRequest = new LambdaRequest(pluginModifiedRequest || request);
				const endpointResponse = await routectx.handler(dispatchRequest, requestContext);

				if (endpointResponse instanceof Response)
					middlewareResponse = endpointResponse;
				else if (('toResponse' satisfies keyof SerializableResponse) in endpointResponse)
					middlewareResponse = endpointResponse.toResponse();
				throw new Error('Invalid function response: ' + (endpointResponse && typeof endpointResponse === 'object') ?
					`object keys ({${Object.keys(endpointResponse).join(', ')}}) don't match handler response interface` :
					`variable of type "${typeof endpointResponse}" is not a valid handler response`);

			} catch (error) {

				console.error('Lambda middleware error:', (error as Error | null)?.message || error);

				interface ErrorResponseData {
					error_text: string;
					error_log?: string;
				};

				const responseData: ErrorResponseData = {
					error_text: 'unhandled middleware error',
				};

				if (this.config.errorResponseType === 'log')
					responseData.error_log = (error as Error | null)?.message || JSON.stringify(error);

				middlewareResponse = new TypedResponse(responseData, { status: 500 }).toResponse();
			}

		//	but if we didn't have a route we'll get to this point
		//	where we handle 404 cases
		//	can't use just "else" here as it would override possible plugin response if a 404 occured.
		//	so we only check for absence of "middlewareResponse",
		//	which would indicate 404 and no plugin response
		} else if (!middlewareResponse) {
			middlewareResponse = new TypedResponse({
				error_text: 'route not found'
			}, { status: 404 }).toResponse();
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

		//	add some headers so the shit always works
		middlewareResponse.headers.set('x-powered-by', 'maddsua/lambda');
		middlewareResponse.headers.set('x-request-id', requestID);

		//	log for, you know, reasons
		if (this.config.loglevel?.requests !== false)	
			console.log(`(${clientIP}) ${request.method} ${requestDisplayUrl} --> ${middlewareResponse.status}`);

		return middlewareResponse;
	}
};
