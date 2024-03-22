import type { ServiceContext } from "./context.ts";
import type { SerializableResponse } from "./responses.ts";

export type HandlerResponse = SerializableResponse | Response;
export type MaybePromise <T> = T | Promise<T>;

export type HandlerFunction <C extends object = {}> =
	(request: Request, context: ServiceContext & C) =>
		MaybePromise<HandlerResponse>;
