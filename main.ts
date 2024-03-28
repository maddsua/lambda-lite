import { ServiceRouter } from './libv3/service/server/router.ts';
import { StateManager } from './libv3/service/state/manager.ts';
import { ActiveDeployEntry } from "./libv3/service/state/schema.ts";

import { startServer } from './libv3/service/server/http.ts';

const server = startServer();

//server.shutdown();

/*const router = new ServiceRouter();

const manager = new StateManager('data', {
	deployService: router.pushService.bind(router),
	removeService: router.removeService.bind(router),
});

const logRestoreError = (ctx: ActiveDeployEntry, error: Error | null) =>
	console.error(`Failed to restore deploy ${ctx.deploy_id} for ${ctx.worker_name}: ${error?.message || null}`);

for (const deploy of await manager.listActiveDeploys()) {
	await manager.publishDeploy(deploy.deploy_id)
		.catch(err => logRestoreError(deploy, err));
}*/

/*
const newworker = await stmgr.createWorker({ name: 'test' });
console.log(newworker);

const sampleModule = `export const GET = () => new Response('get test');`;

//const workerModule = await transformWorker(new TextEncoder().encode(sampleModule).buffer, { name: 'test', deploy_id: 'test' });

const newDeployId = await stmgr.createDeploy(newworker, {
	script: new TextEncoder().encode(sampleModule)
});

await stmgr.publishDeploy(newDeployId);*/
/*
await manager.listActiveDeploys();

//console.log(await stmgr.listWorkers());
//console.log(await stmgr.listDeploys());

const testRequest = new Request('https://octo.host/test/api?v=2');

const result = await router.routeRequest(testRequest);

console.log(result.status, await result.text());*/
