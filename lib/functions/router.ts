import { HandlerFunction } from "./handler.ts";
import { FunctionOptions } from "./options.ts";

export interface FunctionCtx {
	handler: HandlerFunction<any>;
	options?: FunctionOptions;
};

export type FunctionsRouter = Record<string, FunctionCtx>;
