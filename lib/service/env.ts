
const importEnvVariables = [
	'OCTO_PROXY_CLIENT_IP',
	'OCTO_PROXY_REQUEST_ID',
] as const;

export type Env = {[P in keyof typeof importEnvVariables]: string};

export interface Env1 {
	OCTO_PROXY_CLIENT_IP?: string;
	OCTO_PROXY_REQUEST_ID?: string;
};
