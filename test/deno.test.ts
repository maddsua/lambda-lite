import { startServer } from "../deno.mod.ts";
import { methodChecker } from "../lib/plugins/methodChecker.ts";
import { serviceTokenChecker } from "../lib/plugins/serviceTokenChecker.ts";

await startServer({
	serve: {
		port: 8080,
	},
	routesDir: 'test/functions',
	healthcheckPath: '/health',
	plugins: [
		methodChecker({ methods: ['GET'] }),
		serviceTokenChecker({ token: 'test'})
	]
});
