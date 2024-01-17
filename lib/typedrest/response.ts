import type { SerializableResponse } from "../middleware/router.ts";
import type { FetchSchema, TypedFetchResponse } from "../middleware/typedRouter.ts";

export class TypedResponse<
	D extends object | null = null,
	H extends Record<string, string> | undefined = undefined,
	S extends number | undefined = undefined
> implements SerializableResponse, TypedFetchResponse {

	data: D | null;
	headers: H | undefined;
	status: S | undefined;

	constructor(data: D, init?: {
		headers?: H;
		status?: S;
	}) {
		this.data = data || null;
		this.headers = init?.headers;
		this.status = init?.status;
	}

	toResponse(): Response {

		const body = this.data ? JSON.stringify(this.data) : null;
		const headers = new Headers(this.headers);

		if (this.data) headers.set('content-type', 'application/json');

		return new Response(body, { headers, status: this.status });
	}
};

export const unwrapResponse = async <T extends FetchSchema<any>> (response: Response): Promise<T['response']> => {

	const contentIsJSON = response.headers.get('content-type')?.toLowerCase()?.includes('json');
	const responseData = contentIsJSON ? await response.json().catch(() => null) : null;
	if (contentIsJSON && !responseData) throw new Error('Invalid typed response: no data');

	return {
		data: responseData,
		headers: Object.fromEntries(response.headers.entries()),
		status: response.status
	};
};

export type InferResponse<T extends FetchSchema<any>> = TypedResponse<
	T['response']['data'],
	T['response']['headers'],
	T['response']['status']
> | T['response'];
