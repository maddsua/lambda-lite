import { startServer } from "../deno.mod.ts";

await startServer({
	serve: {
		port: 8080,
	},
	routesDir: 'test/functions',
	healthcheckPath: '/health'
});
