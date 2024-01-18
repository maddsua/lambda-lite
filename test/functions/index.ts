import type { RouteConfig, Handler } from '../../lib.mod.ts';
import Component from './index.tsx';

export const config: RouteConfig = {
	//expand: true,
	inheritPlugins: false
};

export const handler: Handler = (request, context) => {
	const htmlcontent = Component().render();
	return new Response(htmlcontent, {
		headers: {
			'content-type': 'text/html'
		}
	});
};
