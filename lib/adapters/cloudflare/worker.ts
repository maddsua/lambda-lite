import type { MiddlewareOptions } from "../../middleware/options.types.ts";
import type { RouterRoutes } from "../../middleware/route.types.ts";
import { LambdaMiddleware } from '../../middleware/middleware.ts';

export interface StartServerOptions extends MiddlewareOptions {
	routes: RouterRoutes;
};

interface RequestProps {
	request: Request;
	env: object;
	ctx: {
		waitUntil: (promise: Promise<any>) => void;
		passThroughOnException: () => void;
	};
};

export const workerFetchHandler = async ({ request, env, ctx }: RequestProps, middleware: LambdaMiddleware) => {

	const networkInfo = {
		transport: 'tcp',
		port: 443,
		hostname: request.headers.get('x-real-ip') || request.headers.get('cf-connecting-ip') || '127.0.0.1'
	} as const;

	const context = {
		env,
		waitUntil: ctx.waitUntil
	};

	return middleware.handler(request, networkInfo, context);
};
