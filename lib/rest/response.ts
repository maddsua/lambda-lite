
export class TypedResponse<
	D extends object | null = null,
	H extends Record<string, string> | undefined = undefined,
	S extends number | undefined = undefined
> {

	data: D;
	headers: H;
	status: S;

	constructor(data: D, init?: {
		headers?: H;
		status?: S;
	}) {
		this.data = data;
		this.headers = init?.headers as H;
		this.status = init?.status as S;
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
		data: T['data'];
		headers: T['headers'];
		status: T['status'];
	};

	return new TypedResponse(await response.json().catch(() => null), {
		headers: Object.fromEntries(response.headers.entries()),
		status: response.status
	} as TypedInit);
};
