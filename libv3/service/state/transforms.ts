
export const envfield = {
	pack: (env?: Record<string, string> | null) => Object.keys(env || {}).length ? JSON.stringify(env) : null,
	unpack: (data?: string | null) => data?.length ? JSON.parse(data) : null,
};
