import Component from './index.tsx';

import type { RouteConfig, RouteHandler } from '../../deno.mod.ts';

export const config: RouteConfig = {
	expand: true,
	allowedMethods: ['GET', 'OPTIONS']
};

export const handler: RouteHandler = (request, context) => {
	const htmlcontent = Component().render();
	return new Response(htmlcontent, {
		headers: {
			'content-type': 'text/html'
		}
	});
};
