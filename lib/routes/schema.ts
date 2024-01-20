
export interface TypedRequestInit {
	data?: object | null;
	headers?: Record<string, string>;
	query?: Record<string, string>;
};

export interface TypedResponseInit {
	data: object | null;
	headers?: Record<string, string>;
	status?: number;
};

export type FetchSchema<T extends {
	request?: TypedRequestInit;
	response?: TypedResponseInit;
}> = {
	request: T['request'] extends object ? T['request'] : undefined;
	response: T['response'] extends object ? T['response'] : undefined;
};
