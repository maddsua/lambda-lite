import { BasicHandler } from "../../deno.mod.ts";

export const handler: BasicHandler = () => ({
	data: {
		success: true,
		purpose: 'imitates a REST API',
		action: 'use your imagination'
	}
});
