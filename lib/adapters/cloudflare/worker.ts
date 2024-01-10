import type { MiddlewareOptions } from "../../middleware/options.ts";
import type { RouterRoutes } from "../../middleware/route.ts";
import { LambdaMiddleware } from '../../middleware/middleware.ts';

export interface StartServerOptions extends MiddlewareOptions {
	routes: RouterRoutes;
};

export const workerFetchHandler = async (request: Request, ctx: object, middleware: LambdaMiddleware) => {

	const networkInfo = {
		transport: 'tcp',
		port: 443,
		hostname: request.headers.get('x-real-ip') || request.headers.get('cf-connecting-ip') || '127.0.0.1'
	} as const;

	return middleware.handler(request, networkInfo, ctx);
};
