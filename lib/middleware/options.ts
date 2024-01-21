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
	 * Enable service paths like /_404 to handle paths that don't exist
	 * 
	 * Defaults to true
	 */
	servicePathsEnabled?: boolean;

	/**
	 * What data should be sent to a client in case of critical endpoint error
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
