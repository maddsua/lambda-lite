import type { ErrorPageType } from "../middleware/opions.ts";
import { ErrorResponse, JSONResponse } from "./responeses.ts";

interface ErrorPageProps {
	message: string;
	status?: number;
	error?: any;
	errorPageType?: ErrorPageType;
};

export const renderErrorResponse = (props: ErrorPageProps): Response => {

	const responeseStatus = props.status || 500;

	const handlerErrorText = props.error ? ((props.error as Error)?.message || JSON.stringify(props.error)) : undefined;
	const handlerErrorStack = props.error ? ((props.error as Error)?.stack || 'unknown stack') : undefined;

	switch (props.errorPageType) {

		case 'json': {

			const errorObject: ErrorResponse = {
				error_text: props.message
			};

			if (props.error) {
				errorObject.error_log = handlerErrorText;
				errorObject.error_stack = handlerErrorStack;
			}

			return new JSONResponse(errorObject, responeseStatus).toResponse();
		};
	
		default: {

			const errorLines: Array<string | null> = [
				props.message,
				null
			];

			if (props.error) {
				errorLines.push(`Error message: ${handlerErrorText}`);
				errorLines.push(`Error stack: ${handlerErrorStack}`);
				errorLines.push(null);
			}

			errorLines.push('maddsua/lambda');

			const errorPageText = errorLines.map(item => item ? item : '').join('\r\n');

			return new Response(errorPageText, {
				headers: {
					'content-type': 'text/plain'
				},
				status: responeseStatus
			});
		}
	}
};
