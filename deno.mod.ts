import type { RouteConfig, RouteHandler } from "./lib/middleware/router.ts";
import { startServer } from "./lib/adapters/deno/server.ts";
import { createEnv, type TypedEnv } from "./lib/util/env.ts";
import type { FetchSchema, TypedRequestInit, TypedResponseInit } from "./lib/middleware/typedRouter.ts";
import { TypedResponse, type InferResponse } from "./lib/typedrest/response.ts";
import { typedFetch } from "./lib/client/fetch.ts";
import { TypedFetchAgent } from "./lib/client/fetchAgent.ts";
import { TypedRequest, unwrapRequest } from "./lib/typedrest/request.ts";
import * as plugins from './lib/plugins/index.ts';

export {

	RouteHandler,
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

	startServer,
}
