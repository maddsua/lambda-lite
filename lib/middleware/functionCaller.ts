import { FunctionContext, HandlerFunction, JSONResponse, SerializableResponse } from "../../mod.ts";
import { ErrorPageType } from "../api/errorPage.ts";
import { ErrorResponse } from "../api/responeses.ts";
import { ErrorPageDetailLevel } from "./opions.ts";

export interface HandlerCallProps {
	handler: HandlerFunction<any>;
	request: Request;
	context: FunctionContext;
	errorPageType?: ErrorPageType;
	errorDetails?: ErrorPageDetailLevel;
};

const renderErrorResponse = (error: any, errorPageType?: ErrorPageType, showErrorDetails?: boolean): Response => {

	const handlerErrorText = (error as Error | null)?.message || JSON.stringify(error);
	const handlerErrorStack = (error as Error | null)?.stack || 'unknown stack';

	switch (errorPageType) {

		case 'json': {

			const errorObject: ErrorResponse = {
				error_text: 'unhandled middleware error'
			};

			if (showErrorDetails) {
				errorObject.error_log = handlerErrorText;
				errorObject.error_stack = handlerErrorStack;
			}

			return new JSONResponse(errorObject, 500).toResponse();
		};
	
		default: {

			const errorLines: Array<string | null> = [
				'Unhandled middleware error',
				null
			];

			if (showErrorDetails) {
				errorLines.push(`Error message: ${handlerErrorText}`);
				errorLines.push(`Error stack: ${handlerErrorStack}`);
			}

			errorLines.push(null);
			errorLines.push('maddsua/lambda');

			const errorPageText = errorLines.map(item => item ? item : '').join('\r\n');

			return new Response(errorPageText, {
				headers: {
					'content-type': 'text/plain'
				},
				status: 500
			});
		}
	}
};

export const safeHandlerCall = async (props: HandlerCallProps): Promise<Response> => {

	try {

		const callbackResult = await props.handler(props.request, props.context);

		if (callbackResult instanceof Response)
			return callbackResult;
		else if (('toResponse' satisfies keyof SerializableResponse) in callbackResult)
			return callbackResult.toResponse();
		else throw new Error('Invalid function esponse: is not a standard Response object or SerializableResponse');

	} catch (error) {
		
		console.error('Lambda middleware error:', error);
		return renderErrorResponse(error, props.errorPageType, props.errorDetails === 'log');
	}
};