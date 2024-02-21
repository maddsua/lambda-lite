import type { FunctionContext, HandlerFunction, SerializableResponse } from "../../mod.ts";
import type { ErrorPageType } from "./opions.ts";
import type { ErrorPageDetailLevel } from "./opions.ts";
import { renderErrorResponse } from "../api/errorPage.ts";

export interface HandlerCallProps {
	handler: HandlerFunction<any>;
	request: Request;
	context: FunctionContext;
	errorPageType?: ErrorPageType;
	detailLevel?: ErrorPageDetailLevel;
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

		return renderErrorResponse({
			message: 'unhandled middleware error',
			status: 500,
			error: props.detailLevel === 'log' ? error : undefined,
			errorPageType: props.errorPageType
		});
	}
};
