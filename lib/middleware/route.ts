import type { JSONResponse } from "../rest/jsonResponse.ts";
import type { ServiceConsole } from "../util/console.ts";
import { MiddlewarePlugin } from "./plugins.ts";

export interface NetworkInfo {
	transport: 'tcp' | 'udp';
	hostname: string;
	port: number;
};

export interface RequestInfo extends NetworkInfo {
	clientIP: string;
	requestID: string;
};

export interface RequestContextBase {

	/**
	 * Request-specific console
	 */
	console: ServiceConsole;

	/**
	 * Request info info, duh
	 */
	requestInfo: RequestInfo;
};

export type RouteResponse = JSONResponse<object> | Response;
export type RouteHandler<C extends object = {}> = (request: Request, context: RequestContextBase & C) => Promise<RouteResponse> | RouteResponse;

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

export interface RouteCtx extends RouteConfig {
	handler: RouteHandler;
};

export type RouterRoutes = Record<`/${string}`, RouteCtx>;
