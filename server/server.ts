import { type ServerRoutes, loadFunctionsFromFS } from "./routes.ts";
import { defaultConfig } from "./config.ts";
import { LambdaMiddleware, type MiddlewareOptions } from "./middleware.ts";

export interface StartServerOptions extends MiddlewareOptions {
	serve?: Deno.ServeOptions | Deno.ServeTlsOptions;
	routes?: ServerRoutes;
};

export const startServer = async (opts?: StartServerOptions) => {

	const searchDir = opts?.routesDir || defaultConfig.routesDir;
	const routes = opts?.routes || await loadFunctionsFromFS(searchDir);
	const middleware = new LambdaMiddleware(routes, opts);

	if (!opts?.serve) {
		Deno.serve(middleware.handler.bind(middleware));
		return
	}

	Deno.serve(opts?.serve, middleware.handler.bind(middleware));
};
