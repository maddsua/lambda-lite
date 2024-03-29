
export type ErrorPageDetailLevel = 'minimal' | 'log';
export type ErrorPageType = 'json' | 'plain';

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
	 * Error page settings
	 */
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
		detailLevel?: ErrorPageDetailLevel
	};
};
