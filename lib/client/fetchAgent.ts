import type { FetchSchema, TypedFetchRequest, RouterSchema } from "../middleware/typedRouter.ts";

interface AgentConfig {
	endpoint: string;
};

type QueryResult <T extends FetchSchema<any>> = Promise<T['response']>;
type QueryAction <T extends FetchSchema<any>> = T['request'] extends never ? () => QueryResult<T> : (opts: T['request']) => QueryResult<T>;
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
