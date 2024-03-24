
import type { HandlerFunction } from "../handlers/handlers.ts";

export interface DeploymentIndex {
	time: number;
	module: string;
	env: Record<string, string>;
};

export interface WebServiceModule extends DeploymentIndex {
	handler: HandlerFunction;
	deploymentID: string;
};

export interface DeplyomentInfo {
	id: string;
	time: number;
};

export interface WebServiceIndexFile {
	deploysments: DeplyomentInfo[];
};
