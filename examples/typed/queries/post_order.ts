import { FetchSchema, TypedHandler, TypedResponse, TypedRouteContext } from "../../../lib.mod.ts";

type Schema = FetchSchema<{
	request: {
		data: {
			person: string;
			product_ids: string[];
			total: number;
		}
	}
	response: {
		data: {
			error_code: string;
		} | null,
		status: 202 | 400 | 500
	}
}>;

export const handler: TypedHandler<Schema> = async (request) => {

	const { data } = await request.unwrap();
	console.log('Order data:', data);

	return new TypedResponse(null, {
		status: 202
	});
};

export default {
	handler
} satisfies TypedRouteContext
