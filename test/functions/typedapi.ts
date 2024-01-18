import type { RouteHandler, TypedRouteHandler } from "../../lib/middleware/router.ts";
import type { FetchSchema } from "../../lib/middleware/router.ts";
import type { InferResponse } from "../../lib/middleware/router.ts";
import { TypedResponse } from "../../lib/api/rest.ts";
import { RouteConfig } from "../../lib/middleware/router.ts";

export const config: RouteConfig = {
	inheritPlugins: false
};

export type Schema = FetchSchema<{
	request: {
		data: {
			id: string;
		}
		headers: {
			'x-captcha': string
		}
	},
	response: {
		data: {
			success: boolean;
			purpose: string;
			action: string
		},
		headers: {
			test: string;
		}
	}
}>;

export const handler: TypedRouteHandler<Schema> = async (request, ctx): Promise<InferResponse<Schema>> => {

	const { data, headers } = await request.unwrap();

	console.log('Received data:', data);

	return new TypedResponse({
		success: true,
		purpose: 'imitates a REST API',
		action: 'use your imagination'
	}, {
		headers: {
			test: 'test'
		}
	});
};
