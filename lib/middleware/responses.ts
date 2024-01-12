
export interface SerializableResponse {
	toResponse(): Response;
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
