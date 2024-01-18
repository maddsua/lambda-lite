import type { MiddlewareOptions } from "../../middleware/options.ts";
import type { BasicRouter } from "../../middleware/router.ts";
import { LambdaMiddleware} from '../../middleware/middleware.ts';
import { defaultConfig } from './config.ts';
import { loadFunctionsFromFS } from './routes.ts';

export interface StartServerOptions extends MiddlewareOptions {

	/**
	 * Basic http server options (passed directory to Deno.serve call)
	 */
	serve?: Deno.ServeOptions | Deno.ServeTlsOptions;

	/**
	 * Define function handlers here if not using FS module loading
	 */
	routes?: BasicRouter;

	/**
	 * Path to the directory containing handler functions
	 */
	routesDir?: string;
};

export const startServer = async (opts?: StartServerOptions) => {

	const searchDir = opts?.routesDir || defaultConfig.routesDir;
	const routes = opts?.routes || await loadFunctionsFromFS(searchDir);
	const middleware = new LambdaMiddleware(routes, opts);

	if (!opts?.serve) {
		Deno.serve((request, info) => middleware.handler(request, info.remoteAddr));
		return;
	}

	Deno.serve(opts.serve, (request, info) => middleware.handler(request, info.remoteAddr));
};
