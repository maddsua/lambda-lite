import type { MiddlewarePlugin } from "./plugins.ts";
import { Handler, TypedHandler } from "../routes/handlers.ts";
import { FetchSchema, RouterSchema } from "../routes/schema.ts";

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

export type BasicRouter = {
	[index: string]: RouteConfig & {
		handler: Handler;
	};
};

export type TypedRouter <T extends RouterSchema<Record<string, FetchSchema<any>>>, C extends object = {}> = {
	[K in keyof T]: RouteConfig & {
		handler: TypedHandler<T[K], C>;
	};
};
