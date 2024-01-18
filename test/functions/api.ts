import { Handler } from "../../lib/routes/handlers.ts";

export const handler: Handler = () => ({
	data: {
		success: true,
		purpose: 'imitates a REST API',
		action: 'use your imagination'
	}
});
