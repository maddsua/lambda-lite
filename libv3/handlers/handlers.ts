import type { HandlerContext } from "./context.ts";
import type { SerializableResponse } from "./responses.ts";

export type HandlerResponse = SerializableResponse | Response;
export type MaybePromise <T> = T | Promise<T>;

export type HandlerFunction <C extends object = {}> =
	(request: Request, context: HandlerContext & C) =>
		MaybePromise<HandlerResponse>;
