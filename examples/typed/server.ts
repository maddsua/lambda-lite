import { startDenoServer } from "../../adapters.mod.ts";
import { InferRouterSchema } from "../../lib.mod.ts";

import statusQuery from './queries/status.ts';
import postOrderQuery from "./queries/post_order.ts";

const routes = {
	status: statusQuery,
	post_order: postOrderQuery,
	untyped: {
		handler: () => new Response('this is an untyped endpoint')
	}
};

export type RouterType = InferRouterSchema<typeof routes>;

await startDenoServer({
	serve: {
		port: 8080,
	},
	routes,
	loglevel: {
		requests: false
	}
});
