import { JSONResponse } from "../../deno.mod.ts";
import { PluginGenerator, MiddlewarePluginBase, PluginBeforeProps } from "../middleware/plugins.ts";

const pluginID = 'lambda_lite-plugin-method_checker';

class MethodCheckerPluginImpl implements MiddlewarePluginBase {

	id = pluginID;
	allowedMethods: Set<string>;

	constructor(init: Set<string>) {
		this.allowedMethods = init;
	}

	executeBefore(props: PluginBeforeProps) {
		const allowedMethods = this.allowedMethods.has(props.middlewareRequest.method);
		if (!allowedMethods) {
			console.log(`Method not allowed (${props.middlewareRequest.method})`);
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

class MethodCheckerPlugin implements PluginGenerator {

	id = pluginID;
	data: Set<string>;

	constructor(methods: HTTPMethod[]) {
		const methodsNormalized = methods.map(item => item.trim().toUpperCase()).filter(item => item.length);
		this.data = new Set(methodsNormalized.length ? methodsNormalized : ['GET']);
	}

	spawn() {
		return new MethodCheckerPluginImpl(this.data);
	}
}

export const methodChecker = (methods: HTTPMethod[] & { 0: HTTPMethod }) => new MethodCheckerPlugin(methods);
