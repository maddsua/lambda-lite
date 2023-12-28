
/**
 * Alternative Response class that automatically handles JSON serialization
 */
export class JSONResponse<T extends object> {

	body: string | null;
	headers: Headers;
	status: number;

	constructor(body?: T | null, init?: {
		status?: number;
		headers?: Headers | Record<string, string>;
	}) {
		this.body = body ? JSON.stringify(body) : null;
		this.headers = init?.headers ? (init.headers instanceof Headers ? init.headers : new Headers(init.headers)) : new Headers();
		this.status = init?.status || 200;
		if (this.body) this.headers.set('content-type', 'application/json');
	}

	toResponse(): Response {
		return new Response(this.body, {
			headers: this.headers,
			status: this.status
		});
	}
};
