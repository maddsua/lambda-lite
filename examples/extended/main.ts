import { startServer } from "../../mod.ts";

await startServer({
	serve: {
		port: 8080,
	},
	loadFunctions: {
		dir: 'examples/extended/functions',
	},
	healthcheckPath: '/health'
});
