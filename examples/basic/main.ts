import { startDenoServer } from "../../adapters.mod.ts";
import { createEnv } from "../../lib.mod.ts";
import { serviceAuth } from "../../plugins.mod.ts";

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
			handler: () => new Response('endpoint not found', { status: 404 })
		},
		'/': {
			handler: () => new Response('well hello there')
		},
		'/api': {
			handler: () => new Response('congrats youre working for the CIA now'),
			plugins: [
				serviceAuth({ token: 'yourefired' })
			]
		},
		'/search': {
			handler: async (request) => {
				const { query } = await request.unwrap();
				if (Object.keys(query).length) {
					console.log('request search:', query);
				}
				return new Response(null, { status: 201 })
			}
		}
	}
});
