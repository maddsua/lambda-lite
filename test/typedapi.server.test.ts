import { LambdaMiddleware } from "../lib/middleware/middleware.ts";
import { workerFetchHandler } from "../lib/adapters/cloudflare/worker.ts";
import { ServerRouter, RouterSchema } from "../lib/middleware/typedRouter.ts";
import { TypedResponse } from "../lib/typedrest/response.ts";

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
		handler: () => ({
			status: 200
		})
	}
};

const lambda = new LambdaMiddleware(routes);

export default {
	async fetch(request: Request, env: any, ctx: any) {
		return workerFetchHandler(request, { env }, lambda);
	}
}
