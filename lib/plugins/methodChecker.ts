import { JSONResponse } from "../rest/jsonResponse.ts";
import { PluginGenerator, MiddlewarePluginBase, PluginBeforeProps, SpawnProps } from "../middleware/plugins.ts";
import { ServiceConsole } from "../util/console.ts";

const pluginID = 'lambda_lite-plugin-method_checker';

class MethodCheckerPluginImpl implements MiddlewarePluginBase {

	id = pluginID;
	allowedMethods: Set<string>;
	useLogs?: boolean;
	console: ServiceConsole;

	constructor(init: {
		allowedMethods: Set<string>;
		useLogs?: boolean;
		console: ServiceConsole;
	}) {
		this.allowedMethods = init.allowedMethods;
		this.useLogs = init.useLogs;
		this.console = init.console;
	}

	executeBefore(props: PluginBeforeProps) {

		const allowedMethods = this.allowedMethods.has(props.request.method);
		if (!allowedMethods) {

			if (this.useLogs) this.console.log(`[Method checker plugin] Method not allowed (${props.request.method})`);

			return {
				overrideResponse: new JSONResponse({
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
	useLogs?: boolean;
};

class MethodCheckerPlugin implements PluginGenerator {

	id = pluginID;
	allowedMethods: Set<string>;
	useLogs?: boolean;

	constructor(init: InitParams) {
		const methodsNormalized = init.methods.map(item => item.trim().toUpperCase()).filter(item => item.length);
		this.allowedMethods = new Set(methodsNormalized.length ? methodsNormalized : ['GET']);
		this.useLogs = init.useLogs;
	}

	spawn(props: SpawnProps) {
		return new MethodCheckerPluginImpl({
			allowedMethods: this.allowedMethods,
			useLogs: this.useLogs,
			console: props.console
		});
	}
}

export const methodChecker = (init: InitParams) => new MethodCheckerPlugin(init);
