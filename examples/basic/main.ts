import { startDenoServer } from "../../adapters.mod.ts";
import { createEnv } from "../../lib.mod.ts";

const env = createEnv({
	port: {
		name: 'PORT',
		type: 'number',
		optional: true
	}
}, Deno.env.toObject());

await startDenoServer({
	serve: {
		port: env.port || 8080,
	},
	healthcheckPath: '/health',
	errorResponseType: 'log',
	routes: {
		'_404': {
			handler: () => new Response('endpoing not found', { status: 404 })
		},
		'/': {
			handler: () => new Response('well hello there')
		}
	}
});
