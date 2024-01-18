
export type ResponseContentType = 'json' | 'html' | 'text';

const typedResponseMimeType: Record<ResponseContentType, string> = {
	json: 'application/json',
	html: 'text/html',
	text: 'text/plain'
};

export const getResponseType = (type?: ResponseContentType) => ((type ? typedResponseMimeType[type] : undefined) || typedResponseMimeType.json);
