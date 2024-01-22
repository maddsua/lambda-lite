import { startDenoServer } from "../../adapters.mod.ts";
import { createEnv } from "../../lib.mod.ts";
import { allowMethods, originController } from "../../plugins.mod.ts";

const env = createEnv({
	port: {
		name: 'PORT',
		type: 'number',
		optional: true
	}
}, Deno.env.toObject());

await startDenoServer({
	serve: {
		port: env.port || 8080,
	},
	loadFunctions: {
		dir: 'examples/extended/functions',
	},
	healthcheckPath: '/health',
	plugins: [
		allowMethods('GET'),
		originController({ allowOrigins: 'all' }),
	]
});
