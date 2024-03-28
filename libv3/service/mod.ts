import { compressResponse } from "./server/compression.ts";
import { ServiceRouter } from './server/router.ts';
import { StateManager } from './state/manager.ts';
import type { ActiveDeployEntry } from "./state/schema.ts";
import type { HandlerContext } from '../workers/handlers/context.ts';

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

const server = Deno.serve({ port: 8264 }, async (req, info) => {

	const hctx: HandlerContext = {
		clientIP: info.remoteAddr.hostname,
		requestID: crypto.randomUUID(),
	};

	const routerResponse = await rootRouter.routeRequest(req, hctx);

	//	good luck figuring out that it's not lambda, fuckers
	routerResponse.headers.set('server', 'maddsua/lambda');
	routerResponse.headers.set('x-request-id', hctx.requestID);

	const compressed = await compressResponse(req, routerResponse);
	if (compressed) return compressed;

	return routerResponse;
});

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
