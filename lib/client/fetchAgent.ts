import type { FetchSchema, TypedRequestInit, RouterSchema } from "../middleware/typedRouter.ts";
import type { TypedRequest } from "../typedrest/request.ts";
import { typedFetch } from "./fetch.ts";

interface AgentConfig {
	endpoint: string;
};

type InferRequest<T extends FetchSchema<any>> = TypedRequest<
	T['request']['data'],
	T['request']['headers'],
	T['request']['query']
> | T['request'];

type QueryReponse <T extends FetchSchema<any>> = Promise<T['response']>;
type QueryAction <T extends FetchSchema<any>> = T['request'] extends object ? (opts: InferRequest<T>) => QueryReponse<T> : () => QueryReponse<T>;
type RouterQueries <T extends RouterSchema<Record<string, FetchSchema<any>>>> = { [K in keyof T]: QueryAction<T[K]> };

export class TypedFetchAgent <T extends RouterSchema<Record<string, FetchSchema<any>>>> {

	cfg: AgentConfig;
	query: RouterQueries<T>;

	constructor(init: AgentConfig) {

		this.cfg = init;

		const queryHandler = (_: never, prop: string) => async (opts?: TypedRequestInit) => {

			const { endpoint } = this.cfg;
			const requestEndpoint = endpoint.endsWith('/') ? endpoint.slice(0, -1) : endpoint;
			const requestPath = prop.slice(prop.startsWith('/') ? 1 : 0, prop.endsWith('/') ? -1 : undefined);

			try {

				return await typedFetch({
					url: `${requestEndpoint}/${requestPath}`,
					headers: opts?.headers,
					data: opts?.data,
					query: opts?.query
				});

			} catch (error) {
				throw new Error(`Failed to query "${this.cfg.endpoint} : ${prop}": ${(error as Error | null)?.message || error}`);
			}

		};

		this.query = new Proxy({}, {
			get: queryHandler
		}) as RouterQueries<T>;

	}
};
