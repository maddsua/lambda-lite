
export class TypedResponse<
	D extends object | null = null,
	H extends Record<string, string> | undefined = undefined,
	S extends number | undefined = undefined
> {

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

export type InferResponseType<T extends {
	data: object | null;
	headers?: Record<string, string>;
	status?: number;
}> = TypedResponse<T['data'], T['headers'], T['status']>;

export const responseToTyped = async <T extends TypedResponse<any, any, any>>(response: Response) => {

	interface TypedInit {
		data: T['data'] | null;
		headers: T['headers'];
		status: T['status'];
	};

	const responseHeaders = Object.fromEntries(response.headers.entries());

	return new TypedResponse(await response.json().catch(() => null), {
		headers: responseHeaders,
		status: response.status
	} as TypedInit);
};
