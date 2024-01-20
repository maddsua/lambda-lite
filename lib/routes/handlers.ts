import type { FetchSchema } from "../routes/schema.ts";
import type { LambdaRequest, SerializableResponse, TypedResponse } from "../middleware/rest.ts";
import type { LambdaContext } from "../middleware/context.ts";

type HandlerResponseValue = SerializableResponse | Response;
type HandlerResponse = Promise<HandlerResponseValue> | HandlerResponseValue;
export type Handler<C extends object = {}> = (request: LambdaRequest<any>, context: LambdaContext & C) => HandlerResponse;

type InferResponse <T extends FetchSchema<any>> = TypedResponse<
	T['response']['data'],
	T['response']['headers'],
	T['response']['status']
>;
type TypedHandlerResponse <T extends FetchSchema<any>> = InferResponse<T> | Promise<InferResponse<T>>;
export type TypedHandler <T extends FetchSchema<any>, C extends object = {}> = (request: LambdaRequest<T>, context: LambdaContext & C) => TypedHandlerResponse<T>;
