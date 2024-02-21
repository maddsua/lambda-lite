import { HandlerFunction, JSONResponse } from "../../../mod.ts";

export const handler: HandlerFunction = () => new JSONResponse({
	success: true,
	purpose: 'imitates a REST API',
	action: 'use your imagination'
});
