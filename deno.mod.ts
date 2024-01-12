import type { RouteConfig, RouteHandler } from "./lib/middleware/route.ts";
import { startServer } from "./lib/adapters/deno/server.ts";
import { createEnv, type TypedEnv } from "./lib/util/env.ts";
import type { FetchSchema, TypedFetchRequest, TypedFetchResponse } from "./lib/rest/typed.ts";
import { TypedResponse, unwrapResponse, type InferResponseType } from "./lib/rest/response.ts";
import { TypedRequest, unwrapRequest } from "./lib/rest/request.ts";
import * as plugins from './lib/plugins/index.ts';

export {

	RouteHandler,
	RouteConfig,

	FetchSchema,
	TypedFetchRequest,
	TypedFetchResponse,

	TypedRequest,
	unwrapRequest,

	TypedResponse,
	InferResponseType,
	unwrapResponse,

	createEnv,
	TypedEnv,

	plugins,

	startServer,
}
