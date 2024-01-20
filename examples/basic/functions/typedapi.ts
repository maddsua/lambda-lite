import {
	type TypedHandler,
	type FetchSchema,
	type RouteConfig,
	TypedResponse
} from "../../../lib.mod.ts";

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

export const handler: TypedHandler<Schema> = async (request, ctx) => {

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
