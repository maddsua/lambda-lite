/**
 * This modules is used for standalone mode startup
 * Provide env variables and just run it from url
 */

import { startServer } from "./server/server.ts";
import { getNumber } from "./server/envutils.ts";

await startServer({
	serve: {
		port: getNumber(Deno.env.get('OCTO_PORT') || Deno.env.get('PORT')),
		hostname: Deno.env.get('OCTO_HOSTNAME'),
		cert: Deno.env.get('OCTO_TLS_CERT'),
		key: Deno.env.get('OCTO_TLS_KEY')
	},
	octo: {
		routesDir: Deno.env.get('OCTO_ROUTES_DIR'),
		handleCORS: Deno.env.get('OCTO_HANDLE_CORS') !== 'false',
		allowedOrigings: Deno.env.get('OCTO_ALLOWED_ORIGINS')?.split(',').map(item => item.trim()),
		rateLimit: {
			period: getNumber(Deno.env.get('OCTO_RATELIMIT_PERIOD')),
			requests: getNumber(Deno.env.get('OCTO_RATELIMIT_REQUESTS')),
		},
		exposeRequestID: Deno.env.get('OCTO_EXPOSE_REQUEST_ID') !== 'false',
	}
});

console.log('\n%c Startup done \n', 'background-color: green; color: black');
