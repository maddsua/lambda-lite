import { LambdaMiddleware } from "../lib/middleware/middleware.ts";
import { workerFetchHandler } from "../lib/adapters/cloudflare/worker.ts";

const lambda = new LambdaMiddleware({
	'/*': {
		handler: () => new Response('yo whasup homie')
	}
}, {
	healthcheckPath: '/health',
	loglevel: {
		//	don't need those on cloudflare lmao
		requests: false
	}
});

export default {
	async fetch(request: Request, env: any, ctx: any) {
		return workerFetchHandler(request, { env }, lambda);
	}
}
