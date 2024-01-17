import { InferResponse } from "../../cloudflare.mod.ts";
import type { FetchSchema, TypedRequestInit, RouterSchema } from "../middleware/typedRouter.ts";
import { InferRequest } from "../typedrest/request.ts";

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
		  
		this.query = new Proxy({}, {

			get(_: never, prop: string) {
				console.log(prop)
				return {
					"ass": true
				};
			},

		}) as RouterQueries<T>;
	}

};
