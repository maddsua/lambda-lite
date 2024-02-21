import type { SerializableResponse } from "../api/responeses.ts";
import type { ServiceConsole } from "./console.ts";

export interface FunctionContext {
	relativePath: string;
	clientIP: string;
	requestID: string;
	console: ServiceConsole;
};

export type HandlerResponse = SerializableResponse | Response;
export type HandlerFunction <C extends object = {}> = (request: Request, context: FunctionContext & C) => Promise<HandlerResponse> | HandlerResponse;
