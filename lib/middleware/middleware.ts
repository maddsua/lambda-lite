import type { MiddlewareOptions } from "./opions.ts";
import type { FunctionContext } from "../functions/handler.ts";
import type { FunctionCtx, FunctionsRouter } from "../functions/router.ts";
import type { SerializableResponse } from "../api/responeses.ts";
import { generateRequestId, getRequestIdFromProxy } from "../util/misc.ts";
import { renderErrorPage } from "../api/errorPage.ts";

export class LambdaMiddleware {

	config: Partial<MiddlewareOptions>;
	handlersPool: FunctionsRouter;

	constructor (routes: FunctionsRouter, config?: Partial<MiddlewareOptions>) {

		this.config = config || {};
		this.handlersPool = {};

		for (const route in routes) {

			const routeCtx = routes[route as keyof typeof routes];

			const routeExpandByUrl = route.endsWith('/*');

			//	warn about path expansion
			if (typeof routeCtx?.options?.expand === 'boolean' && routeExpandByUrl) {
				console.warn(`Route "${route}" has both expanding path and "config.expand" property set, the latest will be used`);
			}

			const handlerCtx: FunctionCtx = {
				handler: routeCtx.handler,
				options: {
					expand: typeof routeCtx?.options?.expand === 'boolean' ? routeCtx.options.expand : routeExpandByUrl
				}
			};

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

	async handler(request: Request, info: Deno.ServeHandlerInfo): Promise<Response> {

		const getProxyRemoteIP = () => {
			const header = this.config.proxy?.forwardedIPHeader;
			if (!header?.length) return null;
			return request.headers.get(header);
		};

		const requestID = getRequestIdFromProxy(request.headers, this.config.proxy?.requestIdHeader) || generateRequestId();
		const clientIP = getProxyRemoteIP() || info.remoteAddr.hostname;

		let requestDisplayUrl = '/';

		//	this scary shit replaces URL object parsing
		//	and from my tests it's ~3x faster.
		//	also it won't throw shit.
		const pathname = request.url.replace(/^[^\/]+\:\/\/[^\/]+/, '').replace(/[\?\#].*$/, '') || '/';
		requestDisplayUrl = pathname;

		// find route path
		const routePathname = pathname.slice(0, pathname.endsWith('/') ? pathname.length - 1 : undefined) || '/';

		//	typescript is too dumb to figure it out so it might need a bin of help here
		let routectx = this.handlersPool[routePathname] as FunctionCtx | undefined;

		// try to find matching wildcart route path
		if (!routectx) {

			const pathComponents = routePathname.slice(1).split('/');
			for (let idx = pathComponents.length; idx >= 0; idx--) {

				const nextRoute = '/' + pathComponents.slice(0, idx).join('/');
				const nextCtx = this.handlersPool[nextRoute];

				if (nextCtx?.options?.expand) {
					routectx = nextCtx;
					break;
				}
			}
		}

		//	try getting 404 fallback handler
		if (!routectx) {
			routectx = this.handlersPool['/_404'];
		}

		const requestContext: FunctionContext = {
			relativePath: requestDisplayUrl,
			clientIP: requestID,
			requestID: requestID
		};

		let functionResponse: Response;

		if (routectx) {

			try {

				const callbackResult = await routectx.handler(request, requestContext);

				if (callbackResult instanceof Response)
					functionResponse = callbackResult;
				else if (('toResponse' satisfies keyof SerializableResponse) in callbackResult)
					functionResponse = callbackResult.toResponse();
				else throw new Error('Invalid function esponse: is not a standard Response object or SerializableResponse');

			} catch (error) {

				console.error('Lambda middleware error:', (error as Error | null)?.message || error);
				functionResponse = renderErrorPage('unhandled middleware error', 500, this.config.errorPageType);
			}

		} else {
			functionResponse = renderErrorPage('function not found', 404, this.config.errorPageType);
		}

		//	add some headers so the shit always works
		functionResponse.headers.set('x-powered-by', 'maddsua/lambda');
		functionResponse.headers.set('x-request-id', requestID);

		//	log for, you know, reasons
		console.log(`(${clientIP}) ${request.method} ${requestDisplayUrl} --> ${functionResponse.status}`);

		return functionResponse;
	}
};
