import type { MiddlewareOptions } from "../../middleware/options.ts";
import type { LambdaRouter } from "../../middleware/router.ts";
import type { NetworkInfo } from "../../middleware/context.ts";
import { LambdaMiddleware } from '../../middleware/middleware.ts';

export interface WorkerStartOptions extends MiddlewareOptions {

	/**
	 * Define API routes
	 */
	routes: LambdaRouter;
};

export const workerFetchHandler = async (request: Request, ctx: object, middleware: LambdaMiddleware) => {

	const networkInfo: NetworkInfo = {
		remoteAddr: {
			transport: 'tcp',
			port: 443,
			hostname: request.headers.get('x-real-ip') || request.headers.get('cf-connecting-ip') || '127.0.0.1'
		}
	};

	return middleware.handler(request, networkInfo, ctx);
};
