import { HandlerFunction } from "../functions/handler.ts";
import { FunctionConfig } from "../functions/options.ts";

export interface FunctionCtx {
	handler: HandlerFunction<any>;
	options?: FunctionConfig;
};

export type FunctionsRouter = Record<string, FunctionCtx>;
