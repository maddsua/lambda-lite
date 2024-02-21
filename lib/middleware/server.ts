import { FunctionLoaderProps, loadFunctionsFromFS } from "../functions/loader.ts";
import { FunctionsRouter } from "./router.ts";
import { LambdaMiddleware } from "./middleware.ts";
import { MiddlewareOptions } from "./opions.ts";

export interface ServerOptions extends MiddlewareOptions {

	/**
	 * Basic http server options (passed directory to Deno.serve call)
	 */
	serve?: Deno.ServeOptions | Deno.ServeTlsOptions;

	/**
	 * Define function handlers if FS module loading is not in use
	 */
	routes?: FunctionsRouter;

	/**
	 * Path to the directory containing handler functions.
	 * Can be overriden by "routes" property
	 */
	loadFunctions?: FunctionLoaderProps;
};

export const startServer = async (opts?: ServerOptions) => {

	let routes = opts?.routes || {};

	if (opts?.loadFunctions) {
		const loaded = await loadFunctionsFromFS(opts.loadFunctions);
		routes = Object.assign({}, loaded, routes);
	}

	if (!Object.keys(routes).length) {
		console.error(
			`%c No routes loaded or provided %c\nAt least one route should be provided\n`,
			'background-color: red; color: white',
			'background-color: inherit; color: inherit'
		);
		throw new Error('no routes to serve');
	}

	const middleware = new LambdaMiddleware(routes, opts);

	if (!opts?.serve) {
		Deno.serve((request, info) => middleware.handler(request, info));
		return;
	}

	Deno.serve(opts.serve, (request, info) => middleware.handler(request, info));
};
