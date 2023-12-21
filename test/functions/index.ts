import Component from './index.tsx';

import { RouteConfig } from "../../server/routes.ts";

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
