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

export type ContextWaitUntilCallback = (promise: Promise<any>) => void;

export interface RuntimeContext {
	env: object;
	waitUntil: ContextWaitUntilCallback;
};

export interface RequestContext<E extends object = {}> {

	/**
	 * Request-specific console
	 */
	console: ServiceConsole;

	/**
	 * Request info info, duh
	 */
	requestInfo: RequestInfo;

	/**
	 * Runtime env variables
	 */
	env: E;

	/**
	 * Runtime context wait until callback
	 */
	waitUntil: ContextWaitUntilCallback;
};

