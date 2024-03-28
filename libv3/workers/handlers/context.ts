import type { HandlerFunction } from "./handlers.ts";

export interface HandlerContext {
	originalUrl?: string | null;
	clientIP: string;
	requestID: string;
};

export interface ModuleHandlers {

	default?: HandlerFunction;
	handler?: HandlerFunction;

	ALL?: HandlerFunction;
	GET?: HandlerFunction;
	HEAD?: HandlerFunction;
	OPTIONS?: HandlerFunction;
	POST?: HandlerFunction;
	PUT?: HandlerFunction;
	DELETE?: HandlerFunction;
};
