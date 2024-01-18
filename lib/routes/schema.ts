import type { TypedRequestInit, TypedResponse, TypedResponseInit } from "../api/rest.ts";

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
