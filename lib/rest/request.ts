
import type { FetchSchema, TypedFetchRequest } from "./typed.ts";
import type { SerializableRequest } from "../middleware/responses.ts";

export class TypedRequest<
	D extends object | null | undefined = undefined,
	H extends Record<string, string> | undefined = undefined,
	Q extends Record<string, string> | undefined = undefined,
> implements SerializableRequest, TypedFetchRequest {

	url: string | URL;
	headers: H;
	data: D;
	query: Q;

	constructor(url: string | URL, init?: {
		headers?: H;
		data?: D;
		query?: Q;
	}) {
		this.url = url;
		this.data = init?.data as D;
		this.headers = init?.headers as H;
		this.query = init?.query as Q;
	}

	toRequest() {

		const requestUrl = this.url instanceof URL ? this.url : new URL(this.url);

		for (const key in this.query) {
			requestUrl.searchParams.set(key, this.query[key]);
		}

		return new Request(requestUrl, {
			method: this.data ? 'POST' : 'GET',
			headers: this.data ? Object.assign({
				'content-type': 'application/json'
			}, this.headers || {}) : this.headers,
			body: this.data ? JSON.stringify(this.data) : null
		});
	}
};

export const unwrapRequest = async <T extends FetchSchema<any>> (request: Request): Promise<T['request']> => {

	const { searchParams } = new URL(request.url);

	if (request.method === 'GET') return {
		headers: Object.fromEntries(request.headers.entries()),
		query: Object.fromEntries(searchParams.entries()),
	};

	const contentIsJSON = request.headers.get('content-type')?.toLowerCase()?.includes('json');
	const requestData = contentIsJSON ? await request.json().catch(() => null) : null;
	if (contentIsJSON && !requestData) throw new Error('Invalid typed request: no data');

	return {
		data: requestData,
		headers: Object.fromEntries(request.headers.entries()),
		query: Object.fromEntries(searchParams.entries())
	};
};
