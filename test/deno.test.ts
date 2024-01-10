import { startServer } from "../deno.mod.ts";
import { methodChecker } from "../lib/plugins/methodChecker.ts";

await startServer({
	serve: {
		port: 8080,
	},
	routesDir: 'test/functions',
	healthcheckPath: '/health',
	plugins: [
		methodChecker(['POST'])
	]
});
