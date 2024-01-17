import { LambdaMiddleware } from "./lib/middleware/middleware.ts";
import type { MiddlewareOptions } from "./lib/middleware/options.ts";
import type { RouteConfig, RouteHandler } from "./lib/middleware/router.ts";
import type { FetchSchema, TypedRequestInit, TypedResponseInit } from "./lib/middleware/typedRouter.ts";
import { TypedResponse, unwrapResponse, type InferResponse } from "./lib/typedrest/response.ts";
import { TypedRequest, unwrapRequest, type InferRequest } from "./lib/typedrest/request.ts";
import { typedFetch } from "./lib/client/fetch.ts";
import { TypedFetchAgent } from "./lib/client/fetchAgent.ts";
import * as plugins from './lib/plugins/index.ts';
import { createEnv, type TypedEnv } from "./lib/util/env.ts";

export {

	LambdaMiddleware,
	MiddlewareOptions,

	RouteHandler,
	RouteConfig,

	FetchSchema,
	TypedRequestInit,
	TypedResponseInit,

	TypedRequest,
	InferRequest,
	unwrapRequest,

	TypedResponse,
	InferResponse,
	unwrapResponse,

	typedFetch,
	TypedFetchAgent,

	createEnv,
	TypedEnv,

	plugins,
}
