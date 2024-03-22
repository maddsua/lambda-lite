
export interface SerializableResponse {
	toResponse(): Response;
};

interface JSONResponseProps {
	headers?: HeadersInit;
	status?: number;
};

export class JSONResponse <T extends object> implements SerializableResponse {

	data: T;
	status: number;
	headers: HeadersInit;

	constructor(data: T, props?: JSONResponseProps) {
		this.data = data;
		this.status = props?.status || 200;
		this.headers = props?.headers || {};
	}

	toResponse(): Response {

		const responseHeaders = new Headers(this.headers);
		responseHeaders.set('content-type', 'application/json');

		return new Response(JSON.stringify(this.data), {
			headers: responseHeaders,
			status: this.status
		});
	}
};

