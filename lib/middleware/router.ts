import type { FetchSchema } from "../routes/schema.ts";
import type { BasicRouteContext, TypedRouteContext } from "../routes/route.ts";
import { TypedHandler } from "../../lib.mod.ts";

export type LambdaRouter = Record<string, BasicRouteContext>;

export type RouterSchema <T extends Record<string, Partial<FetchSchema<any>>>> = {
	[K in keyof T]: {
		request: T[K]['request'] extends object ? T[K]['request'] : undefined;
		response: T[K]['response'] extends object ? T[K]['response'] : undefined;
	}
};

export type TypedRouter <T extends RouterSchema<Record<string, FetchSchema<any>>>, C extends object = {}> = {
	[K in keyof T]: TypedRouteContext<T[K], C>;
};

type MixedRouter = Record<string, BasicRouteContext | TypedRouteContext<any, any>>;
type ExtractRouterSchema <T extends TypedRouteContext> = T['handler'] extends TypedHandler<infer U> ? U : never;

type RemoveNever<T> = {
	[K in keyof T as T[K] extends never ? never : K]: T[K];
};

export type InferRouterSchema <T extends MixedRouter> = RemoveNever<{
	[K in keyof T]: T[K] extends TypedRouteContext ? FetchSchema<{
		request: ExtractRouterSchema<T[K]>['request'];
		response: ExtractRouterSchema<T[K]>['response'];
	}> : never;
}>;
