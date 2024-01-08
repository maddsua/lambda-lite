import type { JSONResponse } from "../api/jsonResponse.ts";
import type { RateLimiterConfig } from "../accessControl/rateLimiter.ts";
import type { RequestContext } from "./runtime.types.ts";
import type { EnvBase } from "../util/envutils.ts";

export type RouteResponse = JSONResponse<object> | Response;
export type RouteHandler<E extends EnvBase = {}> = (request: Request, context: RequestContext<E>) => Promise<RouteResponse> | RouteResponse;

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
