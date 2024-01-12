
export class TypedRequest<
	D extends object | null | undefined = undefined,
	H extends Record<string, string> | undefined = undefined,
	Q extends Record<string, string> | undefined = undefined,
> {

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

		if (this.data) {

			const requestHeader: Record<string, string> = this.headers || {};
			if (this.data) requestHeader['content-type'] = 'application/json';

			return new Request(requestUrl, {
				method: 'POST',
				headers: requestHeader,
				body: JSON.stringify(this.data)
			});
		}

		return new Request(requestUrl, {
			headers: this.headers,
		});
	}
};

export type InferRequestType<T extends {
	data?: object | null;
	headers?: Record<string, string>;
	query?: Record<string, string>;
}> = TypedRequest<T['data'], T['headers'], T['query']>;

export const requestToTyped = async <T extends TypedRequest<any, any, any>> (request: Request) => {

	interface TypedInit {
		data: T['data'];
		headers: T['headers'];
		query: T['query'];
	};

	const { searchParams } = new URL(request.url);

	if (request.method === 'GET') {
		return new TypedRequest(request.url, {
			headers: Object.fromEntries(request.headers.entries()),
			query: Object.fromEntries(searchParams.entries()),
		} as TypedInit);
	}

	return new TypedRequest(request.url, {
		data: await request.json().catch(() => null),
		headers: Object.fromEntries(request.headers.entries()),
		query: Object.fromEntries(searchParams.entries())
	}) as T;
};
