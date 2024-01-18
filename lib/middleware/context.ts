import type { ServiceConsole } from "../util/console.ts";

interface NetworkPeerInfo {
	transport: 'tcp' | 'udp';
	hostname: string;
	port: number;
};

export interface NetworkInfo {
	remoteAddr: NetworkPeerInfo;
};

export interface LambdaContext extends NetworkInfo {

	/**
	 * Request-specific console
	 */
	console: ServiceConsole;

	/**
	 * Client's "real" IP
	 */
	clientIP: string;

	/**
	 * Request unique ID
	 */
	requestID: string;
};
