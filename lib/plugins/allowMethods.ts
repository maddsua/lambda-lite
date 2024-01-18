import { TypedResponse } from "../api/rest.ts";
import type { MiddlewarePlugin, MiddlewarePluginInstance, SpawnProps } from "../middleware/plugins.ts";
import type { ServiceConsole } from "../util/console.ts";

const pluginID = 'llp-method_checker';

class AllowMethodsPluginImpl implements MiddlewarePluginInstance {

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
				respondWith: new TypedResponse({
					error_text: 'method not allowed'
				}, { status: 405 }).toResponse()
			};
		}

		return null;
	}
};

class AllowMethodsPlugin implements MiddlewarePlugin {

	id = pluginID;
	allowedMethods: Set<string>;

	constructor(methods: string[]) {
		const methodsNormalized = methods.map(item => item.trim().toUpperCase()).filter(item => item.length);
		this.allowedMethods = new Set(methodsNormalized.length ? methodsNormalized : ['GET']);
	}

	spawn(props: SpawnProps) {

		const useLogging = props.middleware.config.loglevel?.plugins !== false;

		return new AllowMethodsPluginImpl({
			allowedMethods: this.allowedMethods,
			console: useLogging ? props.console : undefined
		});
	}
}

type HTTPMethod = 'CONNECT' | 'DELETE' | 'GET' | 'HEAD' | 'OPTIONS' | 'POST' | 'PUT' | 'TRACE';
type PluginInit = (HTTPMethod[] & { 0: HTTPMethod }) | HTTPMethod;

export const allowMethods = (init: PluginInit) => new AllowMethodsPlugin(Array.isArray(init) ? init : [init]);
