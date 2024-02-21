import type { ServerOptions } from "./lib/middleware/server.ts";
import type { MiddlewareOptions } from "./lib/middleware/opions.ts";
import type { HandlerFunction, FunctionContext, HandlerResponse } from "./lib/functions/handler.ts";
import type { SerializableResponse } from "./lib/api/responeses.ts";
import type { FunctionConfig } from "./lib/functions/options.ts";

import { JSONResponse } from "./lib/api/responeses.ts";
import { startServer } from "./lib/middleware/server.ts";

export {
	ServerOptions,
	MiddlewareOptions,
	HandlerFunction,
	FunctionContext,
	HandlerResponse,
	SerializableResponse,
	FunctionConfig,

	startServer,
	JSONResponse,
}
