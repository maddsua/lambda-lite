import type { HandlerFunction, FunctionConfig } from "../functions/handler.ts";

export interface FunctionCtx {
	handler: HandlerFunction<any>;
	options?: FunctionConfig;
};

export type FunctionsRouter = Record<string, FunctionCtx>;
