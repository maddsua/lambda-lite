import { FetchSchema, InferResponse } from "../routes/schema.ts";
import type { ServiceConsole } from "../util/console.ts";
import type { SerializableResponse, TypedRouteResponse } from "../middleware/response.ts";
import type { LambdaRequest } from "../middleware/request.ts";

interface NetworkPeerInfo {
	transport: 'tcp' | 'udp';
	hostname: string;
	port: number;
};

export interface NetworkInfo {
	remoteAddr: NetworkPeerInfo;
};

export interface RequestInfo extends NetworkInfo {
	clientIP: string;
	id: string;
};

export interface LambdaContext {

	/**
	 * Request-specific console
	 */
	console: ServiceConsole;

	/**
	 * Request info info, duh
	 */
	requestInfo: RequestInfo;
};

type RouteResponse = TypedRouteResponse | SerializableResponse | Response;
export type Handler<C extends object = {}> = (request: LambdaRequest<any>, context: LambdaContext & C) => Promise<RouteResponse> | RouteResponse;

export type TypedHandler<T extends FetchSchema<any>, C extends object = {}> = (request: LambdaRequest<T>, context: LambdaContext & C) => InferResponse<T> | Promise<InferResponse<T>>;
