import type { FetchSchema } from "../routes/schema.ts";
import { TypedRequest } from "../restapi/typedRequest.ts";

const unwrapResponse = async <T extends FetchSchema<any>> (response: Response): Promise<T['response']> => {

	const contentIsJSON = response.headers.get('content-type')?.toLowerCase()?.includes('json');
	const responseData = contentIsJSON ? await response.json().catch(() => null) : null;
	if (contentIsJSON && !responseData) throw new Error('Invalid typed response: no data');

	return {
		data: responseData,
		headers: Object.fromEntries(response.headers.entries()),
		status: response.status
	};
};

export const typedFetch = async <T extends FetchSchema<any>>(init: T['request'] & { url: string | URL }) => {

	const request = new TypedRequest(init.url, {
		headers: init.headers,
		data: init.data,
		query: init.query
	}).toRequest();

	const response = await fetch(request);

	return await unwrapResponse<T>(response);
};
