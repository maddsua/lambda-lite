import Component from './index.tsx';

import type { RouteConfig, BasicHandler } from '../../deno.mod.ts';

export const config: RouteConfig = {
	//expand: true,
	//inheritPlugins: false
};

export const handler: BasicHandler = (request, context) => {
	const htmlcontent = Component().render();
	return new Response(htmlcontent, {
		headers: {
			'content-type': 'text/html'
		}
	});
};
