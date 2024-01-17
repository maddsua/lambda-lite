import type { InferResponse } from "../typedrest/response.ts";
import type { RequestContextBase, RouteConfig } from "./router.ts";

export interface TypedRequestInit {
	data?: object | null;
	headers?: Record<string, string>;
	query?: Record<string, string>;
};

export interface TypedResponseInit {
	data: object | null;
	headers?: Record<string, string>;
	status?: number;
};

export type FetchSchema<T extends {
	request: TypedRequestInit;
	response: TypedResponseInit;
}> = {
	request: T['request'];
	response: T['response'];
};

export type RouterSchema <T extends Record<string, Partial<FetchSchema<any>>>> = {
	[K in keyof T]: {
		request: T[K]['request'] extends object ? T[K]['request'] : { data: null };
		response: T[K]['response'] extends object ? T[K]['response'] : { data: null };
	}
};

type TypedRouteCtx <T extends FetchSchema<any>, C extends object = {}> = RouteConfig & {
	handler: (request: Request, context: RequestContextBase & C) => InferResponse<T> | Promise<InferResponse<T>>;
};

export type ServerRouter <T extends RouterSchema<Record<string, FetchSchema<any>>>, C extends object = {}> = {
	[K in keyof T]: TypedRouteCtx<T[K], C>;
};
