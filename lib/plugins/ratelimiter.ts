import { JSONResponse } from "../rest/jsonResponse.ts";
import type { PluginGenerator, MiddlewarePluginBase, SpawnProps } from "../middleware/plugins.ts";
import type { ServiceConsole } from "../util/console.ts";

const pluginID = 'lambda_lite-plugin-method_checker';

class RateLimiterPluginImpl implements MiddlewarePluginBase {

	id = pluginID;
	activity: ActivityMap;
	clientIP: string;
	config: RateLimiterConfig;
	console?: ServiceConsole;

	constructor(init: {
		activity: ActivityMap;
		clientIP: string;
		config: RateLimiterConfig;
		console?: ServiceConsole;
	}) {
		this.activity = init.activity;
		this.clientIP = init.clientIP;
		this.config = init.config;
		this.console = init.console;
	}

	executeBefore() {

		const clientActivity = this.activity.get(this.clientIP);
		if (!clientActivity) {

			this.activity.set(this.clientIP, {
				total: 1,
				last: new Date().getTime()
			});

			return null;
		}

		const timeDelta = Math.floor((new Date().getTime() - new Date(clientActivity.last).getTime()) / 1000);
		const resetTime = timeDelta > 0 ? this.config.period - timeDelta : this.config.period;

		clientActivity.total++;
		clientActivity.last = new Date().getTime();

		if (timeDelta >= this.config.period) {
			if (clientActivity.total > 0)
			this.activity.delete(this.clientIP);
			return null;
		}

		if (clientActivity.total > this.config.requests) {

			this.console?.log(`Too many requests (${clientActivity.total}). Wait for ${resetTime}s`);

			return {
				respondWith: new JSONResponse({
					error_text: 'too many requests'
				}, { status: 429 }).toResponse()
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

interface ActivityEntry {
	total: number;
	last: number;
};

type ActivityMap = Map<string, ActivityEntry>;

class RateLimiterPlugin implements PluginGenerator {

	id = pluginID;
	useLogs?: boolean;

	config: RateLimiterConfig;
	activity: ActivityMap;

	static defaultConfig: RateLimiterConfig = {
		period: 3600,
		requests: 25
	};

	constructor(init?: InitParams) {
		this.activity = new Map();
		this.config = Object.assign({}, RateLimiterPlugin.defaultConfig, init);
		this.useLogs = init?.useLogs;
	}

	spawn(props: SpawnProps) {

		const middlewareLogPlugins = props.middleware.config.loglevel?.plugins;
		const useLogging = typeof middlewareLogPlugins === 'boolean' ? middlewareLogPlugins : this.useLogs;

		return new RateLimiterPluginImpl({
			activity: this.activity,
			config: this.config,
			clientIP: props.info.clientIP,
			console: useLogging ? props.console : undefined
		});
	}
}

export const ratelimiter = (init: InitParams) => new RateLimiterPlugin(init);
