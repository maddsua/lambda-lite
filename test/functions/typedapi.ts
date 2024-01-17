import { RouteHandler } from "../../lib/middleware/route.ts";
import { FetchSchema } from "../../lib/rest/typed.ts";
import { InferResponse, TypedResponse } from "../../lib/rest/response.ts";
import { unwrapRequest } from "../../lib/rest/request.ts";
import { RouteConfig } from "../../lib/middleware/route.ts";

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
