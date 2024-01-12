import { RouteHandler } from "../../deno.mod.ts";

export const handler: RouteHandler = () => ({
	data: {
		success: true,
		purpose: 'imitates a REST API',
		action: 'use your imagination'
	}
});
