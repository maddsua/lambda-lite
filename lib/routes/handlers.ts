import type { FetchSchema, InferResponse } from "../routes/schema.ts";
import type { SerializableResponse, TypedRouteResponse } from "../middleware/response.ts";
import type { LambdaRequest } from "../middleware/request.ts";
import type { LambdaContext } from "../middleware/context.ts";

type RouteResponse = TypedRouteResponse | SerializableResponse | Response;
export type Handler<C extends object = {}> = (request: LambdaRequest<any>, context: LambdaContext & C) => Promise<RouteResponse> | RouteResponse;

export type TypedHandler<T extends FetchSchema<any>, C extends object = {}> = (request: LambdaRequest<T>, context: LambdaContext & C) => InferResponse<T> | Promise<InferResponse<T>>;
