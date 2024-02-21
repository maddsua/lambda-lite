import { startServer, type FunctionContext } from "../../mod.ts";
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
		},
		'/catch': {
			handler: (_, ctx: FunctionContext) => {
				console.log('Relative path:', ctx.relativePath);
				return new Response('got it!\r\n' + ctx.relativePath, { status: 200 });
			},
			options: {
				expand: true
			}
		}
	}
});
