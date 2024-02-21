import type { SerializableResponse } from "../api/responeses.ts";

export interface FunctionContext {
	relativePath: string;
	clientIP: string;
	requestID: string;
};

export type HandlerResponse = SerializableResponse | Response;
export type HandlerFunction <C extends object = {}> = (request: Request, context: FunctionContext & C) => Promise<HandlerResponse> | HandlerResponse;
