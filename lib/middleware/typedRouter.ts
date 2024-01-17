import { InferResponse } from "../rest/response.ts";
import { FetchSchema } from "../rest/typed.ts";
import { RequestContextBase, RouteConfig, RouteCtx } from "./router.ts";

export type TypedRouter <T extends Record<string, FetchSchema<any>>> = T;

type TypedRouteResponse<T extends FetchSchema<any>> = InferResponse<T> | Promise<InferResponse<T>>;

export type ServerRouter <T extends TypedRouter<any>, C extends object = {}> = {
	[K in keyof T]: RouteConfig & {
		handler: (request: Request, context: RequestContextBase & C) => TypedRouteResponse<T[K]>;
	};
};
