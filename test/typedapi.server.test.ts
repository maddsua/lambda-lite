import type { ServerRouter, RouterSchema } from "../lib/middleware/typedRouter.ts";
import { TypedResponse } from "../lib/typedrest/response.ts";
import { startServer } from "../lib/adapters/deno/server.ts";
import { unwrapRequest } from "../lib/typedrest/request.ts";

export type RouterType = RouterSchema<{
	'action': {
		response: {
			data: {
				message: string;
			}
		}
	},
	mutation: {
		request: {
			data: {
				id: string
			}
		},
		response: {
			status: 200 | 400
		}
	}
}>;

const routes: ServerRouter<RouterType> = {
	'action': {
		handler: () => new TypedResponse({
			message: 'test'
		})
	},
	mutation: {
		handler: async (request) => {

			const rq = await unwrapRequest<RouterType['mutation']>(request);

			console.log(rq.data)
			return {
				status: 200
			}
		}
	}
};

await startServer({
	serve: {
		port: 8080,
	},
	routes,
	loglevel: {
		requests: false
	}
});
