import type { ServiceConsole } from "../util/console.ts";
import type { MiddlewarePlugin } from "./plugins.ts";
import type {
	LambdaRequest,
	SerializableResponse,
	TypedRouteResponse,
	TypedRequestInit,
	TypedResponseInit,
TypedResponse
} from "../api/rest.ts";


export interface NetworkInfo {
	transport: 'tcp' | 'udp';
	hostname: string;
	port: number;
};

export interface RequestInfo extends NetworkInfo {
	clientIP: string;
	requestID: string;
};


export interface RequestContextBase {

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
export type BasicHandler<C extends object = {}> = (request: LambdaRequest<any>, context: RequestContextBase & C) => Promise<RouteResponse> | RouteResponse;


export interface RouteConfig {

	/**
	 * Exapnd path to catch subpaths too
	 */
	expand?: boolean;

	/**
	 * Set up route-specific plugins
	 */
	plugins?: MiddlewarePlugin[];

	/**
	 * Inherit global plugins
	 */
	inheritPlugins?: boolean;
};

export type BasicRouter = {
	[index: string]: RouteConfig & {
		handler: BasicHandler;
	};
};


export type FetchSchema<T extends {
	request: TypedRequestInit | undefined;
	response: TypedResponseInit | undefined;
}> = {
	request: T['request'];
	response: T['response'];
};

export type InferResponse<T extends FetchSchema<any>> = TypedResponse<
	T['response']['data'],
	T['response']['headers'],
	T['response']['status']
> | T['response'];

export type RouterSchema <T extends Record<string, Partial<FetchSchema<any>>>> = {
	[K in keyof T]: {
		request: T[K]['request'] extends object ? T[K]['request'] : undefined;
		response: T[K]['response'] extends object ? T[K]['response'] : undefined;
	}
};

export type TypedHandler<T extends FetchSchema<any>, C extends object = {}> = (request: LambdaRequest<T>, context: RequestContextBase & C) => InferResponse<T> | Promise<InferResponse<T>>;

export type TypedRouter <T extends RouterSchema<Record<string, FetchSchema<any>>>, C extends object = {}> = {
	[K in keyof T]: RouteConfig & {
		handler: TypedHandler<T[K], C>;
	};
};
