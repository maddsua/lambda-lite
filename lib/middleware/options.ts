import { MiddlewarePlugin } from "./plugins.ts";

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
	 * Default app response payloads
	 */
	defaultResponses?: {

		/**
		 * Default response to root http path when no handler was matched
		 */
		index?: 'notfound' | 'info' | 'teapot' | 'forbidden';

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
