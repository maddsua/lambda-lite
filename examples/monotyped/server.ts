import { TypedRouter, TypedResponse, RouterSchema } from "../../lib.mod.ts";
import { startDenoServer } from "../../adapters.mod.ts";

export type RouterType = RouterSchema<{
	action: {
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

const routes: TypedRouter<RouterType> = {
	action: {
		handler: () => new TypedResponse({
			message: 'test'
		})
	},
	mutation: {
		handler: async (request) => {

			const uwr = await request.unwrap();

			console.log(uwr.data);

			return new TypedResponse(null, {
				status: 200
			});
		}
	}
};

await startDenoServer({
	serve: {
		port: 8080,
	},
	routes,
	loglevel: {
		requests: false
	}
});
