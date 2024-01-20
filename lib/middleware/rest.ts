import type { FetchSchema, TypedResponseInit } from "../routes/schema.ts";

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
