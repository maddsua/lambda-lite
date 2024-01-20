import type { MiddlewarePlugin } from "../middleware/plugins.ts";
import { Handler, TypedHandler } from "../routes/handlers.ts";
import { FetchSchema } from "../routes/schema.ts";

export interface RouteConfig {

	/**
	 * Exapnd path to catch subpaths too
	 */
	expand?: boolean;

	/**
	 * Set up route-specific plugins
	 */
	plugins?: MiddlewarePlugin[];

	/**
	 * Inherit global plugins
	 */
	inheritPlugins?: boolean;
};

export interface BasicRouteContext extends RouteConfig {
	handler: Handler;
};

export interface TypedRouteContext <T extends FetchSchema<any> = any, C extends object = {}> extends RouteConfig {
	handler: TypedHandler<T, C>;
};
