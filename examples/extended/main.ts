import { startServer } from "../../mod.ts";
import { createEnv } from "../deps.ts";

const env = createEnv({
	port: {
		name: 'PORT',
		type: 'number',
		optional: true
	}
}, Deno.env.toObject());

await startServer({
	serve: {
		port: env.port || 8080,
	},
	loadFunctions: {
		dir: 'examples/extended/functions',
	},
	healthcheckPath: '/health'
});
