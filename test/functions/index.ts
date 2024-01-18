import Component from './index.tsx';

import type { RouteConfig, Handler } from '../../deno.mod.ts';

export const config: RouteConfig = {
	//expand: true,
	//inheritPlugins: false
};

export const handler: Handler = (request, context) => {
	const htmlcontent = Component().render();
	return new Response(htmlcontent, {
		headers: {
			'content-type': 'text/html'
		}
	});
};
