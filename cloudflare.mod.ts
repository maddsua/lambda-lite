import { LambdaMiddleware } from "./lib/middleware/middleware.ts";
import type { MiddlewareOptions } from "./lib/middleware/options.ts";
import type { RouteConfig, BasicHandler } from "./lib/middleware/router.ts";
import type { FetchSchema, TypedRequestInit, TypedResponseInit } from "./lib/middleware/typedRouter.ts";
import { TypedResponse, type InferResponse } from "./lib/typedrest/response.ts";
import { TypedRequest, unwrapRequest } from "./lib/typedrest/request.ts";
import { typedFetch } from "./lib/client/fetch.ts";
import { TypedFetchAgent } from "./lib/client/fetchAgent.ts";
import * as plugins from './lib/plugins/index.ts';
import { createEnv, type TypedEnv } from "./lib/util/env.ts";
import { workerFetchHandler, type StartServerOptions } from "./lib/adapters/cloudflare/worker.ts";

export {

	LambdaMiddleware,
	MiddlewareOptions,

	BasicHandler,
	RouteConfig,

	FetchSchema,
	TypedRequestInit,
	TypedResponseInit,

	TypedRequest,
	unwrapRequest,

	TypedResponse,
	InferResponse,
	
	typedFetch,
	TypedFetchAgent,

	createEnv,
	TypedEnv,

	plugins,

	workerFetchHandler,
	StartServerOptions
}
