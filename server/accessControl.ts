
export class OriginChecker {

	allowedOrigins: string[];

	constructor(origins: string[]) {

		this.allowedOrigins = [];

		for (const entry of origins) {

			if (!entry.includes('://')) {
				this.allowedOrigins.push(entry);
				continue;
			}

			try {
				this.allowedOrigins.push(new URL(entry).hostname);
			} catch (error) {
				console.error(`Invalid origin string: "${entry}"`);
			}
		}
	}

	check(rqOrigin: string) {

		if (!rqOrigin) return false;

		let hostnameStart = rqOrigin.indexOf("://");
		if (hostnameStart === -1) return false;
		hostnameStart += 3;
		
		const portStart = rqOrigin.indexOf(':', hostnameStart);
		const pathStart = rqOrigin.indexOf('/', hostnameStart);
		
		let hostnameEnd = undefined;

		if (portStart !== -1) {
			hostnameEnd = portStart;
		} else if (pathStart !== -1) {
			hostnameEnd = pathStart;
		}

		const originHostname = rqOrigin.slice(hostnameStart, hostnameEnd);

		return this.allowedOrigins.some(domain => (
			originHostname === domain ||
			originHostname.endsWith(`.${domain}`)
		));
	}
};

export interface RateLimiterConfig {
	period: number,
	requests: number
};

export class RateLimiter {

	config: RateLimiterConfig;
	activity: Map<string, {
		total: number;
		last: number;
	}>;

	static defaultConfig: RateLimiterConfig = {
		period: 3600,
		requests: 25
	};

	constructor(config?: Partial<RateLimiterConfig>) {
		this.activity = new Map();
		this.config = RateLimiter.defaultConfig;
		if (config) this.setConfig(config);
	}

	setConfig(config: Partial<RateLimiterConfig>) {
		for (let key in config) {
			if (typeof RateLimiter.defaultConfig[key as keyof RateLimiterConfig] === typeof config[key as keyof RateLimiterConfig]) {
				this.config[key as keyof RateLimiterConfig] = config[key as keyof typeof config] as RateLimiterConfig[keyof RateLimiterConfig];
			}
		}
	}

	check(options: {
		ip: string;
	}) {

		const clientActivity = this.activity.get(options.ip);
		if (!clientActivity) {
			this.activity.set(options.ip, {
				total: 1,
				last: new Date().getTime()
			});
			return {
				ok: true,
				requests: 0,
				reset: this.config.period
			};
		}

		const timeDelta = Math.floor((new Date().getTime() - new Date(clientActivity.last).getTime()) / 1000);
		const resetTime = timeDelta > 0 ? this.config.period - timeDelta : this.config.period;

		clientActivity.total++;
		clientActivity.last = new Date().getTime();

		if (timeDelta >= this.config.period) {
			if (clientActivity.total > 0)
			this.activity.delete(options.ip);
			return {
				ok: true,
				requests: clientActivity.total,
				reset: resetTime
			};
		}

		if (clientActivity.total > this.config.requests) {
			return {
				ok: false,
				requests: clientActivity.total,
				reset: resetTime
			};
		}

		return {
			ok: true,
			requests: clientActivity.total,
			reset: resetTime
		};
	}
};

export class MethodChecker {
	data: Set<string>;

	constructor(methods: string[]) {
		const methodsNormalized = methods.map(item => item.trim().toUpperCase()).filter(item => item.length);
		this.data = new Set(methodsNormalized);
	}

	check(method: string): boolean {
		return this.data.has(method.toUpperCase());
	}
};