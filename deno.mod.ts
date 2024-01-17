import type { RouteConfig, RouteHandler } from "./lib/middleware/router.ts";
import { startServer } from "./lib/adapters/deno/server.ts";
import { createEnv, type TypedEnv } from "./lib/util/env.ts";
import type { FetchSchema, TypedRequestInit, TypedResponseInit } from "./lib/middleware/typedRouter.ts";
import { TypedResponse, unwrapResponse, type InferResponse } from "./lib/typedrest/response.ts";
import { typedFetch } from "./lib/client/fetch.ts";
import { TypedRequest, unwrapRequest, type InferRequest } from "./lib/typedrest/request.ts";
import * as plugins from './lib/plugins/index.ts';

export {

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

	createEnv,
	TypedEnv,

	plugins,

	startServer,
}
