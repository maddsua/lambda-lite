import type { MiddlewareOptions } from "./lib/middleware/options.ts";
import type { RouteConfig } from "./lib/middleware/router.ts";
import type { Handler, TypedHandler } from "./lib/routes/handlers.ts";
import { TypedRequest, type TypedRequestInit } from "./lib/restapi/typedRequest.ts";
import { TypedResponse, type TypedResponseInit } from "./lib/restapi/typedResponse.ts";
import type { FetchSchema } from "./lib/routes/schema.ts";
import { LambdaMiddleware } from "./lib/middleware/middleware.ts";
import { typedFetch } from "./lib/client/fetch.ts";
import { TypedFetchAgent } from "./lib/client/fetchAgent.ts";
import * as plugins from './lib/plugins/index.ts';
import { createEnv, type TypedEnv } from "./lib/util/env.ts";

import { workerFetchHandler, type StartServerOptions } from "./lib/adapters/cloudflare/worker.ts";

export {

	LambdaMiddleware,
	MiddlewareOptions,

	Handler,
	TypedHandler,
	RouteConfig,

	FetchSchema,
	TypedRequestInit,
	TypedResponseInit,

	TypedRequest,
	TypedResponse,

	typedFetch,
	TypedFetchAgent,

	createEnv,
	TypedEnv,

	plugins,
	
	workerFetchHandler,
	StartServerOptions,
}
