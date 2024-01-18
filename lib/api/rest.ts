import { FetchSchema } from "../../cloudflare.mod.ts";

export interface SerializableResponse {
	toResponse(): Response;
};

export interface SerializableRequest {
	toRequest(): Request;
};

type ResponseContentType = 'json' | 'html' | 'text';

export interface TypedRouteResponse {
	data?: object;
	headers?: Record<string, string>;
	status?: number;
	type?: ResponseContentType;
};

export const typedResponseMimeType: Record<ResponseContentType, string> = {
	json: 'application/json',
	html: 'text/html',
	text: 'text/plain'
};

export interface TypedRequestInit {
	data?: object | null;
	headers?: Record<string, string>;
	query?: Record<string, string>;
};

export interface TypedResponseInit {
	data: object | null;
	headers?: Record<string, string>;
	status?: number;
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

export class TypedResponse<
	D extends object | null = null,
	H extends Record<string, string> | undefined = undefined,
	S extends number | undefined = undefined
> implements SerializableResponse, TypedResponseInit {

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

export class LambdaRequest <T extends FetchSchema<any>> extends Request {

	constructor(init: Request) {
		super(init);
	}

	async unwrap(): Promise<T['request']> {
		const { searchParams } = new URL(this.url);

		if (this.method === 'GET') return {
			headers: Object.fromEntries(this.headers.entries()),
			query: Object.fromEntries(searchParams.entries()),
		};
	
		const contentIsJSON = this.headers.get('content-type')?.toLowerCase()?.includes('json');
		const requestData = contentIsJSON ? await this.json().catch(() => null) : null;
		if (contentIsJSON && !requestData) throw new Error('Invalid typed request: no data');
	
		return {
			data: requestData,
			headers: Object.fromEntries(this.headers.entries()),
			query: Object.fromEntries(searchParams.entries())
		};
	}
};
