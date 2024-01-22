import type { FetchSchema, TypedRequestInit } from "../routes/schema.ts";
import type { LambdaRequest, SerializableResponse, TypedResponse } from "../middleware/rest.ts";
import type { LambdaContext } from "../middleware/context.ts";

export type HandlerResponse = SerializableResponse | Response;
export type Handler<C extends object = {}> = (request: LambdaRequest, context: LambdaContext & C) => Promise<HandlerResponse> | HandlerResponse;

type InferResponse <T extends FetchSchema<any>> = TypedResponse<
	T['response']['data'],
	T['response']['headers'],
	T['response']['status']
>;
type TypedHandlerResponse <T extends FetchSchema<any>> = InferResponse<T> | Promise<InferResponse<T>>;
export type TypedHandler <T extends FetchSchema<any>, C extends object = {}> = (request: LambdaRequest<T['request']>, context: LambdaContext & C) => TypedHandlerResponse<T>;
