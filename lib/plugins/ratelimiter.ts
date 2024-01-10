import { JSONResponse } from "../rest/jsonResponse.ts";
import type { PluginGenerator, MiddlewarePluginBase, PluginBeforeProps, SpawnProps } from "../middleware/plugins.ts";
import type { ServiceConsole } from "../util/console.ts";

const pluginID = 'lambda_lite-plugin-method_checker';

class RateLimiterPluginImpl implements MiddlewarePluginBase {

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

	executeBefore(props: PluginBeforeProps) {

		const allowedMethods = this.allowedMethods.has(props.request.method);
		if (!allowedMethods) {

			this.console?.warn(`[Method checker plugin] Method not allowed (${props.request.method})`);

			return {
				overrideResponse: new JSONResponse({
					error_text: 'method not allowed'
				}, { status: 405 }).toResponse()
			};
		}
		return null;
	}
};

interface RateLimiterConfig {
	period: number;
	requests: number;
};

interface InitParams extends RateLimiterConfig {
	useLogs?: boolean;
};

class RateLimiterPlugin implements PluginGenerator {

	id = pluginID;
	useLogs?: boolean;

	config: RateLimiterConfig;
	activity: Map<string, {
		total: number;
		last: number;
	}>;

	static defaultConfig: RateLimiterConfig = {
		period: 3600,
		requests: 25
	};

	constructor(init?: InitParams) {
		this.activity = new Map();
		this.config = RateLimiterPlugin.defaultConfig;
		if (init) this.setConfig(init);
		this.useLogs = init?.useLogs;
	}

	setConfig(config: Partial<RateLimiterConfig>) {
		for (let key in config) {
			if (typeof RateLimiterPlugin.defaultConfig[key as keyof RateLimiterConfig] === typeof config[key as keyof RateLimiterConfig]) {
				this.config[key as keyof RateLimiterConfig] = config[key as keyof typeof config] as RateLimiterConfig[keyof RateLimiterConfig];
			}
		}
	}

	spawn(props: SpawnProps) {

		const middlewareLogPlugins = props.middleware.config.loglevel?.plugins;
		const useLogging = typeof middlewareLogPlugins === 'boolean' ? middlewareLogPlugins : this.useLogs;

		return new RateLimiterPluginImpl({
			allowedMethods: this.allowedMethods,
			console: useLogging ? props.console : undefined
		});
	}
}

export const ratelimiter = (init: InitParams) => new RateLimiterPlugin(init);
