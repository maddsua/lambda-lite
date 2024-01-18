import type { TypedRequestInit } from "../restapi/typedRequest.ts";
import type { TypedResponseInit, TypedResponse } from "../restapi/typedResponse.ts";

export type FetchSchema <T extends Partial<{
	request: TypedRequestInit | undefined;
	response: TypedResponseInit | undefined;
}>> = {
	request: T['request'] extends object ? T['request'] : undefined;
	response: T['response'] extends object ? T['response'] : undefined;
};

export type InferResponse <T extends FetchSchema<any>> = TypedResponse<
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
