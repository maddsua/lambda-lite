import { JSONResponse } from "../rest/jsonResponse.ts";
import type { MiddlewarePlugin, MiddlewarePluginInstance, SpawnProps } from "../middleware/plugins.ts";
import type { ServiceConsole } from "../util/console.ts";

const pluginID = 'llp-ratelimiter';

class RateLimiterPluginImpl implements MiddlewarePluginInstance {

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

			this.console?.log(`[Rate limiter] Too many requests (${clientActivity.total}). Wait for ${resetTime}s`);

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

	/**
	 * Time frame in seconds
	 */
	period: number;

	/**
	 * Number of requests allowed for a client in the time frame
	 */
	requests: number;
};

interface ActivityEntry {
	total: number;
	last: number;
};

type ActivityMap = Map<string, ActivityEntry>;

class RateLimiterPlugin implements MiddlewarePlugin {

	id = pluginID;

	config: RateLimiterConfig;
	activity: ActivityMap;

	static defaultConfig: RateLimiterConfig = {
		period: 3600,
		requests: 25
	};

	constructor(init?: RateLimiterConfig) {
		this.activity = new Map();
		this.config = Object.assign({}, RateLimiterPlugin.defaultConfig, init);
	}

	spawn(props: SpawnProps) {

		const useLogging = props.middleware.config.loglevel?.plugins !== false;

		return new RateLimiterPluginImpl({
			activity: this.activity,
			config: this.config,
			clientIP: props.info.clientIP,
			console: useLogging ? props.console : undefined
		});
	}
}

export const ratelimiter = (init: RateLimiterConfig) => new RateLimiterPlugin(init);
