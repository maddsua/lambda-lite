import type { ModuleHandlers } from "../../workers/handlers/context.ts";

export interface WorkerContext {
	worker_name: string;
	deploy_id: string;
};

export type GlobalContextVariable = '__octo_worker_ctx__';
export const workerCtxGlobal: GlobalContextVariable = '__octo_worker_ctx__';

export const packGlobalContext = (ctx: WorkerContext) => `const ${workerCtxGlobal} = ${JSON.stringify(ctx)};`;

export const workerModuleHandlers: (keyof ModuleHandlers)[] = [
	'default',
	'handler',
	'ALL',
	'GET',
	'POST',
	'OPTIONS',
	'HEAD',
	'POST',
	'PUT',
	'DELETE'
];

export const validateModule = (module: any): Error | null => {

	let hasHandler = false;

	for (const item of workerModuleHandlers) {
		if (module[item]) {
			hasHandler = true;
			break;
		}
	}

	if (!hasHandler) {
		return new Error('Worker script has no exported handlers');
	}

	return null;
};

export interface WorkerDeployModule extends ModuleHandlers {
	//	hehehe
};

export interface WebServiceModuleContext {
	deploymentID: string;
	env: Record<string, string>;
	mod: WorkerDeployModule;
};
