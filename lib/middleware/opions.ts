import type { ErrorPageType } from "../api/errorPage.ts";

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

	errorPage?: {
		/**
		 * What kind of error page to display
		 */
		type?: ErrorPageType;
		/**
		 * What data should be sent to a client in case of critical endpoint error
		 * 
		 * Defaults to 'minimal'
		 */
		detailLevel?: 'minimal' | 'log';
	};
};
