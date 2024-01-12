import type { SerializableResponse } from "../middleware/responses.ts";
import type { FetchSchema, TypedFetchResponse } from "./typed.ts";

export class TypedResponse<
	D extends object | null = null,
	H extends Record<string, string> | undefined = undefined,
	S extends number | undefined = undefined
> implements SerializableResponse, TypedFetchResponse {

	data: D | null;
	headers: H | undefined;
	status: S | undefined;

	constructor(data?: D, init?: {
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

export type InferResponseType<T extends FetchSchema<any>> = TypedResponse<
	T['response']['data'],
	T['response']['headers'],
	T['response']['status']
> | T['response'];

export const responseToTyped = async <T extends FetchSchema<any>> (response: Response) => {

	const contentIsJSON = response.headers.get('content-type')?.toLowerCase()?.includes('json');
	const responseData = contentIsJSON ? await response.json().catch(() => null) : null;
	if (contentIsJSON && !responseData) throw new Error('Invalid typed response: no data');

	return new TypedResponse(responseData as any, {
		headers: Object.fromEntries(response.headers.entries()),
		status: response.status
	}) as InferResponseType<T>;
};
