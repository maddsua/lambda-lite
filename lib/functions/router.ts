import { HandlerFunction } from "./handler.ts";
import { FunctionConfig } from "./options.ts";

export interface FunctionCtx {
	handler: HandlerFunction<any>;
	options?: FunctionConfig;
};

export type FunctionsRouter = Record<string, FunctionCtx>;
