import { RouteHandler } from "../../lib/middleware/router.ts";
import { FetchSchema } from "../../lib/middleware/typedRouter.ts";
import { InferResponse, TypedResponse } from "../../lib/typedrest/response.ts";
import { unwrapRequest } from "../../lib/typedrest/request.ts";
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

export const handler: RouteHandler = async (rq, ctx): Promise<InferResponse<Schema>> => {

	const { data, headers } = await unwrapRequest<Schema>(rq);

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
