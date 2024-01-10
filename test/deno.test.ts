import { startServer } from "../deno.mod.ts";
import { allowMethods } from "../lib/plugins/allowMethods.ts";
import { serviceTokenChecker } from "../lib/plugins/serviceTokenChecker.ts";
import { cors } from "../lib/plugins/cors.ts";
import { ratelimiter } from "../lib/plugins/ratelimiter.ts";

await startServer({
	serve: {
		port: 8080,
	},
	routesDir: 'test/functions',
	healthcheckPath: '/health',
	plugins: [
	//	allowMethods('GET'),
	//	serviceTokenChecker({ token: 'test'}),
		cors({ allowOrigins: 'all' }),
		ratelimiter({
			requests: 5,
			period: 25
		})
	]
});
