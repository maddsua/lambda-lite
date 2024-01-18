
export type ResponseContentType = 'json' | 'html' | 'text';

const responseMimeTypes: Record<ResponseContentType, string> = {
	json: 'application/json',
	html: 'text/html',
	text: 'text/plain'
};

export const getResponseType = (type?: ResponseContentType) => {
	if (!type) return responseMimeTypes.json;
	return responseMimeTypes[type] || responseMimeTypes.json;
};

export interface SerializableResponse {
	toResponse(): Response;
};

export interface SerializableRequest {
	toRequest(): Request;
};

export interface TypedRouteResponse {
	data?: object;
	headers?: Record<string, string>;
	status?: number;
	type?: ResponseContentType;
};
