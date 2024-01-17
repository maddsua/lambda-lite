import { ServerRouter, RouterSchema } from "../lib/middleware/typedRouter.ts";
import { TypedResponse } from "../lib/typedrest/response.ts";
import { startServer } from "../lib/adapters/deno/server.ts";

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

await startServer({
	serve: {
		port: 8080,
	},
	routes
});
