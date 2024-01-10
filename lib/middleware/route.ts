import type { JSONResponse } from "../rest/jsonResponse.ts";
import type { RateLimiterConfig } from "../accessControl/rateLimiter.ts";
import type { ServiceConsole } from "../util/console.ts";

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

export type HTTPMethod = 'CONNECT' | 'DELETE' | 'GET' | 'HEAD' | 'OPTIONS' | 'POST' | 'PUT' | 'TRACE';

export interface RouteConfig {
	expand?: boolean;
	ratelimit?: RateLimiterConfig | null;
	allowedOrigings?: string[] | 'all';
	allowedMethods?: HTTPMethod[] | HTTPMethod;
	serviceToken?: string | null;
};

export interface RouteCtx extends RouteConfig {
	handler: RouteHandler;
};

export type RouterRoutes = Record<`/${string}`, RouteCtx>;
