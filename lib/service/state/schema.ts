
export interface WorkerInit {
	name: string;
};

export interface WorkerMetadata extends WorkerInit {
	uid: string;
};

export interface WorkerRecord extends WorkerInit {
	uid: string;
	active_deploy: string | null;
};

export interface DeployInit {
	comment?: string;
	env?: Record<string, string>;
	script: ArrayBuffer;
};

export interface DeployRecord {
	uid: string;
	worker_id: string;
	time: number;
	comment: string | null;
	env: Record<string, string> | null;
	script: ArrayBuffer;
};

export interface DeployMetadata {
	uid: string;
	worker_id: string;
	time: number;
	comment?: string;
};

export interface ActiveDeployEntry {
	worker_name: string;
	deploy_id: string;
};
