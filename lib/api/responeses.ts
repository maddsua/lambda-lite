
export interface SerializableResponse {
	toResponse(): Response;
};

export class JSONResponse <T extends object> implements SerializableResponse {

	data: T;
	status: number;

	constructor(data: T, status?: number) {
		this.data = data;
		this.status = status || 200;
	}

	toResponse(): Response {

		const responseHeaders: HeadersInit = {
			'content-type': 'application/json'
		};

		return new Response(JSON.stringify(this.data), {
			headers: responseHeaders,
			status: this.status
		});
	}
};
