import type { ServiceConsole } from '../util/console.ts';
import type { EnvBase } from "../util/envutils.ts";

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
	env: EnvBase;
	waitUntil: ContextWaitUntilCallback;
};

export interface RequestContext<E extends EnvBase = {}> {

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

