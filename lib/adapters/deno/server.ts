import type { MiddlewareOptions } from "../../middleware/options.ts";
import type { LambdaRouter } from "../../middleware/router.ts";
import { LambdaMiddleware } from '../../middleware/middleware.ts';
import { loadFunctionsFromFS } from './routes.ts';

export interface ServerOptions extends MiddlewareOptions {

	/**
	 * Basic http server options (passed directory to Deno.serve call)
	 */
	serve?: Deno.ServeOptions | Deno.ServeTlsOptions;

	/**
	 * Define function handlers if FS module loading is not in use
	 */
	routes?: LambdaRouter;

	/**
	 * Path to the directory containing handler functions
	 */
	routesDir?: string;
};

export const startServer = async (opts?: ServerOptions) => {

	const searchDir = opts?.routesDir || './functions';
	const routes = opts?.routes || await loadFunctionsFromFS(searchDir);
	const middleware = new LambdaMiddleware(routes, opts);

	if (!opts?.serve) {
		Deno.serve((request, info) => middleware.handler(request, info));
		return;
	}

	Deno.serve(opts.serve, (request, info) => middleware.handler(request, info));
};
