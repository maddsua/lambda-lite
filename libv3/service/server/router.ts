import { SerializableResponse } from "../../workers/handlers/responses.ts";
import type { WebServiceModuleContext } from "../scripts/modules.ts";
import type { DeployCtx } from "../state/hooks.ts";

type RouterMode = 'path' | 'host';

export interface RouterSettings {
	routerMode: RouterMode;
	proxiedClientIp?: string;
};

type PoolInit = [string, WebServiceModuleContext][];

const resolveWorkerName = (request: Request, mode: RouterMode): string | null => {
	switch (mode) {

		case 'host': {

			const hostname = request.headers.get('host')?.match(/[\w\d\-\_]+(\.[\w\d\-\_]+)+/i)?.[0];
			return hostname || null;

		};

		case 'path': {

			const pathname = request.url
				.replace(/^[\w\d]+\:\/\/[^\/]+\//, '/')
				.replace(/\?.+$/, '');

			const workerName = pathname.slice(1).split('/').at(0);
			return workerName || null;
		};
	
		default: return null
	}
};

export class ServiceRouter {

	m_cfg: RouterSettings;
	m_pool: Record<string, WebServiceModuleContext> = {};

	constructor(cfg?: Partial<RouterSettings>, workersInit?: PoolInit) {

		this.m_cfg = Object.assign({
			routerMode: 'path'
		} satisfies RouterSettings, cfg || {});

		if (workersInit?.length) {
			this.m_pool = Object.fromEntries(workersInit);
		}
	}

	removeService(id: string) {
		delete this.m_pool[id];
	}

	async pushService(id: string, ctx: DeployCtx) {
		this.m_pool[id] = {
			deploymentID: ctx.id,
			env: ctx.env,
			mod: await import(new TextDecoder().decode(ctx.script))
		};
	}

	async routeRequest(request: Request): Promise<Response> {

		const workerName = resolveWorkerName(request, this.m_cfg.routerMode);
		if (!workerName) {
			return new Response(`Worker name not provided`, { status: 404 });
		}

		const worker = this.m_pool[workerName];
		if (!worker) {
			return new Response(`Worker "${workerName}" not found`, { status: 404 });
		}

		//	pick a handler
		const { mod, env: workerEnv } = worker;
		const handlerFunc = mod[request.method as keyof typeof mod] || mod.ALL || mod.handler || mod.default;
		if (!handlerFunc) {
			console.error('No handler registered for worker');
			return new Response('Worker is not ready', { status: 502 });
		}

		try {
			
			const requestCtx = Object.assign({}, workerEnv, { clientIP: 'test', requestID: 'test' });
			const workerResponse = await handlerFunc(request, requestCtx);
			
			if (workerResponse instanceof Response)
				return workerResponse;
			else if (('toResponse' satisfies keyof SerializableResponse) in workerResponse)
				return workerResponse.toResponse();
			else throw new Error('Invalid function esponse: is not a standard Response object or SerializableResponse');

		} catch (err) {
			console.error(err);
			return new Response('Worker failed to respond', { status: 503 });
		}
	}
};
