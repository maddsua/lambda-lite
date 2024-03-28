import { ServiceRouter } from './server/router.ts';
import { StateManager } from './state/manager.ts';
import { ActiveDeployEntry } from "./state/schema.ts";

const rootRouter = new ServiceRouter();

const manager = new StateManager('data', {
	deployService: rootRouter.pushService.bind(rootRouter),
	removeService: rootRouter.removeService.bind(rootRouter),
});

const logRestoreError = (ctx: ActiveDeployEntry, error: Error | null) =>
	console.error(`Failed to restore deploy ${ctx.deploy_id} for ${ctx.worker_name}: ${error?.message || null}`);

for (const deploy of await manager.listActiveDeploys()) {
	await manager.publishDeploy(deploy.deploy_id)
		.catch(err => logRestoreError(deploy, err));
}

const server = Deno.serve({ port: 8264 }, (req, info) => rootRouter.routeRequest(req));

const exitcall = async () => {
	await server.shutdown();
	manager.shutdown();
	Deno.exit(0);
};

if (Deno.build.os !== 'windows') {
	Deno.addSignalListener('SIGKILL', exitcall);
	Deno.addSignalListener('SIGTERM', exitcall);
} else {
	Deno.addSignalListener('SIGINT', exitcall);
	Deno.addSignalListener('SIGBREAK', exitcall);
}
