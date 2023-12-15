import { type ServerRoutes, loadFunctionsFromFS } from "./routes.ts";
import { defaultConfig } from "./config.ts";
import { OctoMiddleware, type OctopussOptions } from "./middleware.ts";

export interface StartServerOptions {
	serve?: Deno.ServeOptions | Deno.ServeTlsOptions;
	octo?: OctopussOptions;
	routes?: ServerRoutes;
};

export const startServer = async (opts?: StartServerOptions) => {

	const searchDir = opts?.octo?.routesDir || defaultConfig.routesDir;
	const routes = opts?.routes || await loadFunctionsFromFS(searchDir);
	const middleware = new OctoMiddleware(routes, opts?.octo);

	if (!opts?.serve) {
		Deno.serve(middleware.handler.bind(middleware));
		return
	}

	Deno.serve(opts?.serve, middleware.handler.bind(middleware));
};
