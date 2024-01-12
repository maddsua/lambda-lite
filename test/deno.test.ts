import { startServer } from "../deno.mod.ts";
import { allowMethods } from "../lib/plugins/allowMethods.ts";
import { serviceAuth } from "../lib/plugins/serviceAuth.ts";
import { originController } from "../lib/plugins/originController.ts";
import { ratelimiter } from "../lib/plugins/ratelimiter.ts";
import { createEnv } from "../lib/util/env.ts";
import { ipLists } from "../lib/plugins/iplists.ts";

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
		allowMethods('GET'),
	//	serviceAuth({ token: 'test'}),
		originController({ allowOrigins: 'all' }),
		ratelimiter({
			requests: 5,
			period: 25
		}),
	/*	ipLists({
			whitelist: ['127.0.0.1'],
			blacklist: ['0.0.0.0/0']
		})
	*/
	]
});
