
export interface DeployCtx {
	id: string;
	env: Record<string, string>;
	script: ArrayBuffer;
};

export interface ManagerHooks {
	deployService: (name: string, service: DeployCtx) => Promise<void>;
	removeService: (name: string) => void;
};
