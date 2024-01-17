import { LambdaMiddleware } from "../lib/middleware/middleware.ts";
import { workerFetchHandler } from "../lib/adapters/cloudflare/worker.ts";

const routes = {
	'/*': {
		handler: () => new Response('yo whassup homie')
	}
};

const lambda = new LambdaMiddleware(routes, {
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
