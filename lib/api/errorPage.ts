import { TypedResponse } from "./responeses.ts";

export type ErrorPageType = 'json' | 'basic';

export interface ErrorResponse {
	error_text: string;
};

export const renderErrorPage = (message: string, status: number, type?: ErrorPageType): Response => {

	switch (type) {

		case 'json': {

			const errorObject: ErrorResponse = {
				error_text: message
			};

			return new TypedResponse(errorObject, status).toResponse();
		};
	
		default: {

			const errorMessage = `Backend error: ${message} \r\nmaddsua/lambda\r\n`

			return new Response(errorMessage, {
				headers: {
					'content-type': 'text/plain'
				},
				status
			});
		}
	}
};