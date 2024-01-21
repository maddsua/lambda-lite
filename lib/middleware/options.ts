import type { MiddlewarePlugin } from "./plugins.ts";

export interface MiddlewareOptions {

	/**
	 * Proxy options. The stuff that gets passed to the application by the reverse proxy if you have one
	 */
	proxy?: {
		forwardedIPHeader?: string;
		requestIdHeader?: string;
	};

	/**
	 * Enable automatic health responses on this url
	 */
	healthcheckPath?: `/${string}`;

	/**
	 * What data should be sent to a client in case of critical endpoint error
	 * 
	 * Defaults to 'minimal'
	 */
	errorResponseType?: 'minimal' | 'log';

	/**
	 * Logging settings
	 */
	loglevel?: {

		/**
		 * Log incoming requests and their response metadata
		 */
		requests?: boolean;

		/**
		 * Log plugin events
		 */
		plugins?: boolean;
	};

	/**
	 * Middleware plugins
	 */
	plugins?: MiddlewarePlugin[];
};
