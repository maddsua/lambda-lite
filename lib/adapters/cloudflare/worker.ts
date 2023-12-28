import type { ServerRoutes, MiddlewareOptions } from '../../middleware/middleware.types.ts';
import { LambdaMiddleware} from '../../middleware/middleware.ts';

export interface StartServerOptions extends MiddlewareOptions {

	/**
	 * Define function handlers here if not using FS module loading
	 */
	routes: ServerRoutes;
};

export const startServer = async (opts: StartServerOptions) => {

	const middleware = new LambdaMiddleware(opts.routes, opts);

};
