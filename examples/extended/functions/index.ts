import { HandlerFunction } from "../../../mod.ts";
import Component from './index.tsx';

export const handler: HandlerFunction = (request, context) => {
	const htmlcontent = Component().render();
	return new Response(htmlcontent, {
		headers: {
			'content-type': 'text/html'
		}
	});
};
