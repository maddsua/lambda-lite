import {
	workerFetchHandler,
	type WorkerStartOptions
} from "./lib/adapters/cloudflare/worker.ts";

import {
	startServer as startDenoServer,
	type ServerOptions as DenoServerOptions
} from "./lib/adapters/deno/server.ts";

export {
	workerFetchHandler,
	WorkerStartOptions,

	startDenoServer,
	DenoServerOptions,
}
