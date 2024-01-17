import { InferResponse } from "../rest/response.ts";
import { FetchSchema } from "../rest/typed.ts";
import { RequestContextBase, RouteConfig } from "./router.ts";

export type RouterSchema <T extends Record<string, FetchSchema<any>>> = T;

type TypedRouteCtx <T extends FetchSchema<any>, C extends object = {}> = RouteConfig & {
	handler: (request: Request, context: RequestContextBase & C) => InferResponse<T> | Promise<InferResponse<T>>;
};

export type ServerRouter <T extends RouterSchema<any>, C extends object = {}> = {
	[K in keyof T]: TypedRouteCtx<T[K], C>;
};
