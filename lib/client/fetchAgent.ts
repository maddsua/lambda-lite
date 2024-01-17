import type { FetchSchema, TypedFetchRequest } from "../middleware/typedRouter.ts";

export type InferRouter<T extends Record<string, FetchSchema<any>>> = {
	[K in keyof T]: T[K] extends FetchSchema<any> ? T[K]['request'] : T[K];
};

interface AgentConfig {
	endpoint: string;
};

export class TypedFetchAgent<T extends FetchSchema<any>> {

	cfg: AgentConfig;
	query: T;

	constructor(init: AgentConfig) {

		this.cfg = init;
		  
		this.query = new Proxy({}, {

			get(_: never, prop: string) {
				console.log(prop)
				return {
					"ass": true
				};
			},

		}) as T;
	}

};
