import { startServer } from "../mod.ts";

await startServer({
	serve: {
		port: 8080,
	},
	octo: {
		routesDir: 'test/functions',
		healthcheckPath: '/health'
	}
});
