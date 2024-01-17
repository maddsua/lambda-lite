import type { InferResponse } from "../typedrest/response.ts";
import type { FetchSchema, TypedRequestInit, RouterSchema } from "../middleware/typedRouter.ts";
import { InferRequest, TypedRequest,  } from "../typedrest/request.ts";
import { unwrapResponse } from "../typedrest/response.ts";

interface AgentConfig {
	endpoint: string;
};

type QueryReponse <T extends FetchSchema<any>> = Promise<InferResponse<T>>;
type QueryAction <T extends FetchSchema<any>> = T['request'] extends object ? (opts: InferRequest<T>) => QueryReponse<T> : () => QueryReponse<T>;
type RouterQueries <T extends RouterSchema<any>> = { [K in keyof T]: QueryAction<T[K]> };

export class TypedFetchAgent <T extends RouterSchema<Record<string, FetchSchema<any>>>> {

	cfg: AgentConfig;
	query: RouterQueries<T>;

	constructor(init: AgentConfig) {

		this.cfg = init;

		const queryHandler = (_: never, prop: string) => async (opts?: TypedRequestInit) => {

			const request = new TypedRequest(this.cfg.endpoint + prop, {
				headers: opts?.headers,
				data: opts?.data,
				query: opts?.query
			}).toRequest();
		
			try {
				const response = await fetch(request);
				return await unwrapResponse(response);
			} catch (error) {
				throw new Error(`Failed to query "${this.cfg.endpoint} : ${prop}": ${(error as Error | null)?.message || error}`);
			}
		};

		this.query = new Proxy({}, {
			get: queryHandler
		}) as RouterQueries<T>;
	}

};
