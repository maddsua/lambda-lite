import { JSONResponse } from "../rest/jsonResponse.ts";
import type { MiddlewarePlugin, MiddlewarePluginInstance, SpawnProps } from "../middleware/plugins.ts";
import type { ServiceConsole } from "../util/console.ts";

const pluginID = 'lambda_lite-plugin-method_checker';

class MethodCheckerPluginImpl implements MiddlewarePluginInstance {

	id = pluginID;
	allowedMethods: Set<string>;
	console?: ServiceConsole;

	constructor(init: {
		allowedMethods: Set<string>;
		console?: ServiceConsole;
	}) {
		this.allowedMethods = init.allowedMethods;
		this.console = init.console;
	}

	executeBefore(request: Request) {

		const allowedMethods = this.allowedMethods.has(request.method);
		if (!allowedMethods) {

			this.console?.warn(`[Method checker] Method not allowed (${request.method})`);

			return {
				respondWith: new JSONResponse({
					error_text: 'method not allowed'
				}, { status: 405 }).toResponse()
			};
		}

		return null;
	}
};

type HTTPMethod = 'CONNECT' | 'DELETE' | 'GET' | 'HEAD' | 'OPTIONS' | 'POST' | 'PUT' | 'TRACE';

interface InitParams {
	methods: HTTPMethod[] & { 0: HTTPMethod };
};

class MethodCheckerPlugin implements MiddlewarePlugin {

	id = pluginID;
	allowedMethods: Set<string>;

	constructor(init: InitParams) {
		const methodsNormalized = init.methods.map(item => item.trim().toUpperCase()).filter(item => item.length);
		this.allowedMethods = new Set(methodsNormalized.length ? methodsNormalized : ['GET']);
	}

	spawn(props: SpawnProps) {

		const useLogging = props.middleware.config.loglevel?.plugins !== false;

		return new MethodCheckerPluginImpl({
			allowedMethods: this.allowedMethods,
			console: useLogging ? props.console : undefined
		});
	}
}

export const methodChecker = (init: InitParams) => new MethodCheckerPlugin(init);
