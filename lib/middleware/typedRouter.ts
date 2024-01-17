import type { InferResponse } from "../typedrest/response.ts";
import type { RequestContextBase, RouteConfig } from "./router.ts";

export interface TypedFetchRequest {
	data?: object | null;
	headers?: Record<string, string>;
	query?: Record<string, string>;
};

export interface TypedFetchResponse {
	data: object | null;
	headers?: Record<string, string>;
	status?: number;
};

export type FetchSchema<T extends {
	request: TypedFetchRequest;
	response: TypedFetchResponse;
}> = {
	request: T['request'];
	response: T['response'];
};

export type TypedRouter <T extends Record<string, FetchSchema<any>>> = T;

type TypedRouteCtx <T extends FetchSchema<any>, C extends object = {}> = RouteConfig & {
	handler: (request: Request, context: RequestContextBase & C) => InferResponse<T> | Promise<InferResponse<T>>;
};

export type ServerRouter <T extends TypedRouter<Record<string, FetchSchema<any>>>, C extends object = {}> = {
	[K in keyof T]: TypedRouteCtx<T[K], C>;
};
