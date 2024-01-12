import { RouteHandler } from "../../deno.mod.ts";
import { FetchSchema } from "../../lib/rest/typed.ts";
import { InferResponseType, TypedResponse } from "../../lib/rest/response.ts";
import { requestToTyped } from "../../lib/rest/request.ts";

export type Schema = FetchSchema<{
	request: {
		id: string;
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

export const handler: RouteHandler = async (rq, ctx): Promise<InferResponseType<Schema>> => {

	const request = await requestToTyped<Schema>(rq);

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
