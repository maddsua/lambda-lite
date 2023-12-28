import Component from './index.tsx';

import type { RouteConfig } from '../../mod.ts';

export const config: RouteConfig = {
	expand: true,
	allowedMethods: ['GET', 'OPTIONS']
};

export const handler = () => {
	const htmlcontent = Component().render();
	return new Response(htmlcontent, {
		headers: {
			'content-type': 'text/html'
		}
	});
};
