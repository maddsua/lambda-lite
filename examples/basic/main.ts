import { startServer } from "../../mod.ts";
import { createEnv } from "../deps.ts";

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
	healthcheckPath: '/health',
	errorPage: {
		detailLevel: 'log',
	},
	routes: {
		'_404': {
			handler: () => new Response('endpoint not found', { status: 404 })
		},
		'error': {
			handler: () => {
				throw new Error('test error');
				return new Response('yo wtf', { status: 500 });
			}
		},
		'/': {
			handler: () => new Response('well hello there')
		},
		'/api': {
			handler: () => new Response('congrats youre working for the CIA now')
		}
	}
});
