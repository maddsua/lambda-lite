import type { SerializableResponse } from "../middleware/response.ts";

export interface TypedResponseInit {
	data: object | null;
	headers?: Record<string, string>;
	status?: number;
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
