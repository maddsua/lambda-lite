import { startServer } from "../deno.mod.ts";
import { allowMethods } from "../lib/plugins/allowMethods.ts";
import { serviceTokenChecker } from "../lib/plugins/serviceTokenChecker.ts";
import { originController } from "../lib/plugins/originController.ts";
import { ratelimiter } from "../lib/plugins/ratelimiter.ts";
import { createEnv } from "../lib/util/env.ts";

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
	routesDir: 'test/functions',
	healthcheckPath: '/health',
	plugins: [
	//	allowMethods('GET'),
	//	serviceTokenChecker({ token: 'test'}),
		originController({ allowOrigins: 'all' }),
		ratelimiter({
			requests: 5,
			period: 25
		})
	]
});
