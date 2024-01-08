import type { ServerRoutes, MiddlewareOptions } from '../../middleware/middleware.types.ts';
import { LambdaMiddleware } from '../../middleware/middleware.ts';

export interface StartServerOptions extends MiddlewareOptions {

	/**
	 * Define function handlers here if not using FS module loading
	 */
	routes: ServerRoutes;
};

interface RequestProps {
	request: Request;
	env: Record<string, string>;
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
