import type { ServerRoutes, MiddlewareOptions } from '../../middleware/middleware.types.ts';
import { LambdaMiddleware} from '../../middleware/middleware.ts';

export interface StartServerOptions extends MiddlewareOptions {

	/**
	 * Define function handlers here if not using FS module loading
	 */
	routes: ServerRoutes;
};

export const startServer = <EnvType>(opts: StartServerOptions) => {

	const middleware = new LambdaMiddleware(opts.routes, opts);

	return {
		async fetch(request: Request, env: EnvType, ctx: object) {
			
			return await middleware.handler(request, {
				transport: 'tcp',
				port: 443,
				hostname: request.headers.get('x-real-ip') || request.headers.get('cf-connecting-ip') || '127.0.0.1'
			});
		}
	};
};
