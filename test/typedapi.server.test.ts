import { LambdaMiddleware } from "../lib/middleware/middleware.ts";
import { workerFetchHandler } from "../lib/adapters/cloudflare/worker.ts";
import { ServerRouter, TypedRouter } from "../lib/middleware/typedRouter.ts";
import { TypedResponse } from "../lib/typedrest/response.ts";

type RouterType = TypedRouter<{
	'/*': {
		response: {
			data: {
				message: string;
			}
		}
	}
}>;

const routes: ServerRouter<RouterType> = {
	'/*': {
		handler: () => new TypedResponse({
			message: 'test'
		})
	}
};

const lambda = new LambdaMiddleware(routes);

export default {
	async fetch(request: Request, env: any, ctx: any) {
		return workerFetchHandler(request, { env }, lambda);
	}
}
