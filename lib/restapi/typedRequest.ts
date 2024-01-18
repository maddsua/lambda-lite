import type { SerializableRequest } from "../middleware/response.ts";

export interface TypedRequestInit {
	data?: object | null;
	headers?: Record<string, string>;
	query?: Record<string, string>;
};

export class TypedRequest<
	D extends object | null | undefined = undefined,
	H extends Record<string, string> | undefined = undefined,
	Q extends Record<string, string> | undefined = undefined,
> implements SerializableRequest, TypedRequestInit {

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

		let requestURL = this.url;

		const assembleSearchQuery = (params?: URLSearchParams) => {

			if (!params) params = new URLSearchParams();

			for (const key in this.query) {
				params.set(key, this.query[key]);
			}

			return params;
		};

		if (typeof requestURL === 'string') {

			const searchStarts = requestURL.indexOf('?');
			const requestSearch = assembleSearchQuery();
			
			if (requestSearch.size) {
				requestURL += searchStarts === -1 ? '?' : '&' + requestSearch.toString();
			}

		} else {
			assembleSearchQuery(requestURL.searchParams);
		}

		return new Request(requestURL, {
			method: this.data ? 'POST' : 'GET',
			headers: this.data ? Object.assign({
				'content-type': 'application/json'
			}, this.headers || {}) : this.headers,
			body: this.data ? JSON.stringify(this.data) : null
		});
	}
};
