import { Handler, TypedResponse } from "../../../lib.mod.ts";

export const handler: Handler = () => new TypedResponse({
	success: true,
	purpose: 'imitates a REST API',
	action: 'use your imagination'
});
