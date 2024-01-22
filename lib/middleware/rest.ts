import type { TypedRequestInit, TypedResponseInit } from "../routes/schema.ts";

export class LambdaRequest <T extends TypedRequestInit = any> extends Request {

	constructor(init: Request) {
		super(init);
	}

	async unwrap(): Promise<T> {

		const searchQuery = this.url.replace(/^[^?]*\?/, '').replace(/\#.+$/, '');
		const query: Record<string, string> = {};

		if (searchQuery.length) {
			const params = searchQuery.split('&');
			for (const item of params) {
				const [key, value] = item.split('=');
				if (key.length && value.length) {
					query[key] = value;
				}
			}
		}

		const headers: Record<string, string> = {};
		for (const [header, value] of this.headers) {
			headers[header] = value;
		}

		if (this.method === 'GET')
			return { headers, query } as T;
	
		const contentIsJSON = this.headers.get('content-type')?.toLowerCase()?.includes('json');
		const data = contentIsJSON ? await this.json().catch(() => null) : null;
		if (contentIsJSON && !data) throw new Error('Invalid typed request: unable to parse request body');

		return { data, headers, query } as T;
	}
};

export interface SerializableResponse {
	toResponse(): Response;
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
