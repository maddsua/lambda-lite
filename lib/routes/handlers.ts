import { FetchSchema, InferResponse } from "../routes/schema.ts";
import type { ServiceConsole } from "../util/console.ts";
import type { TypedRouteResponse, SerializableResponse, LambdaRequest } from "../api/rest.ts";

export interface NetworkInfo {
	transport: 'tcp' | 'udp';
	hostname: string;
	port: number;
};

export interface RequestInfo extends NetworkInfo {
	clientIP: string;
	requestID: string;
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
