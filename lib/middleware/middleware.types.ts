import type { RateLimiterConfig } from '../accessControl/rateLimiter.ts';
import type { JSONResponse } from '../api/jsonResponse.ts';
import type { ServiceConsole } from '../util/console.ts';

export interface NetworkInfo {
	transport: 'tcp' | 'udp';
	hostname: string;
	port: number;
};

export interface RequestInfo extends NetworkInfo {
	clientIP: string;
	requestID: string;
};

export interface RequestContext {

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
export type RouteHandler = (request: Request, context: RequestContext) => Promise<RouteResponse> | RouteResponse;

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

export type ServerRoutes = Record<`/${string}`, RouteCtx>;

export interface MiddlewareOptions {

	/**
	 * Proxy options. The stuff that gets passed to the application by the reverse proxy if you have one
	 */
	proxy?: {
		forwardedIPHeader?: string;
		requestIdHeader?: string;
	};

	/**
	 * Request rate limiting options
	 */
	rateLimit?: Partial<RateLimiterConfig>;

	/**
	 * Enables automatic CORS response
	 */
	handleCORS?: boolean;

	/**
	 * Set a list of allowed origings. Requests that don't match these origins will be rejected with authorization error
	 */
	allowedOrigings?: string[];

	/**
	 * Set a security token that a client would need to pass in authorization header in order to access the service
	 */
	serviceToken?: string;

	/**
	 * Enable automatic health responses on this url
	 */
	healthcheckPath?: `/${string}`;

	/**
	 * Default app response payloads
	 */
	defaultResponses?: {

		/**
		 * Default response to root http path when no handler was matched
		 */
		index?: 'notfound' | 'info' | 'teapot' | 'forbidden'

		/**
		 * Default not found response
		 */
		notfound?: 'notfound' | 'forbidden';

		/**
		 * Default error response
		 */
		error?: 'basic' | 'log';
	};

	/**
	 * Logging settings
	 */
	loglevel?: {

		/**
		 * Log incoming requests and their response metadata
		 */
		requests?: boolean;
	};
};
