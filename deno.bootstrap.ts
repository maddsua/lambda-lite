/**
 * This modules is used for standalone mode startup
 * Provide env variables and just run it from url
 */

import { startServer } from "./lib/adapters/deno/server.ts";
import { getNumber } from "./lib/util/envutils.ts";

await startServer({
	serve: {
		port: getNumber(Deno.env.get('LLAPP_PORT') || Deno.env.get('PORT')),
		hostname: Deno.env.get('LLAPP_HOSTNAME'),
	},
	routesDir: Deno.env.get('LLAPP_ROUTES_DIR'),
	handleCORS: Deno.env.get('LLAPP_HANDLE_CORS') !== 'false',
	allowedOrigings: Deno.env.get('LLAPP_ALLOWED_ORIGINS')?.split(',').map(item => item.trim()),
	rateLimit: {
		period: getNumber(Deno.env.get('LLAPP_RATELIMIT_PERIOD')),
		requests: getNumber(Deno.env.get('LLAPP_RATELIMIT_REQUESTS')),
	},
	serviceToken: Deno.env.get('LLAPP_SERVICE_TOKEN')
});

console.log('\n%c Startup done \n', 'background-color: green; color: black');
