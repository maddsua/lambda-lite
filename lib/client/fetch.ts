import { unwrapResponse } from "../rest/response.ts";
import { FetchSchema } from "../middleware/typedRouter.ts";
import { TypedRequest } from "../rest/request.ts";

export const typedFetch = async <T extends FetchSchema<any>>(init: T['request'] & { url: string | URL }) => {

	const request = new TypedRequest(init.url, {
		headers: init.headers,
		data: init.data
	}).toRequest();

	const response = await fetch(request);

	return await unwrapResponse<T>(response);
};
