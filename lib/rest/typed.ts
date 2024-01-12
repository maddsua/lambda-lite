
export interface TypedFetchRequest {
	data?: object;
	headers?: Record<string, string>;
	query?: Record<string, string>;
};

export interface TypedFetchResponse {
	data: object | null;
	headers?: Record<string, string>;
	status?: number;
};

export type FetchSchema<T extends {
	request: TypedFetchRequest;
	response: TypedFetchResponse;
}> = {
	request: T['request'];
	response: T['response'];
};
