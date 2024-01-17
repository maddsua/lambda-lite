import type { RouteConfig, RouteHandler } from "./lib/middleware/route.ts";
import { startServer } from "./lib/adapters/deno/server.ts";
import { createEnv, type TypedEnv } from "./lib/util/env.ts";
import type { FetchSchema, TypedFetchRequest, TypedFetchResponse } from "./lib/rest/typed.ts";
import { TypedResponse, unwrapResponse, type InferResponse } from "./lib/rest/response.ts";
import { typedFetch } from "./lib/client/fetch.ts";
import { TypedRequest, unwrapRequest, type InferRequest } from "./lib/rest/request.ts";
import * as plugins from './lib/plugins/index.ts';

export {

	RouteHandler,
	RouteConfig,

	FetchSchema,
	TypedFetchRequest,
	TypedFetchResponse,

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
