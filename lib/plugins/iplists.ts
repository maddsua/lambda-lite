import { TypedResponse } from "../typedrest/response.ts";
import type { MiddlewarePlugin, MiddlewarePluginInstance, SpawnProps } from "../middleware/plugins.ts";
import type { ServiceConsole } from "../util/console.ts";

const pluginID = 'llp-ip_lists';

const parseIPv4FromString = (ipstring: string) => {

	const blocks = ipstring.replace(/\/\d+$/, '').replace(/[^\d\.]+/g, '').split('.').map(item => parseInt(item));
	if (blocks.length !== 4 || blocks.some(item => isNaN(item)))
		throw new Error(`IPv4 address "${ipstring}" is not valid`);

	return ((BigInt(blocks[0]) << BigInt(24)) | (BigInt(blocks[1]) << BigInt(16)) | (BigInt(blocks[2]) << BigInt(8)) | BigInt(blocks[3]));
};

const parseIPv6FromString = (ipstring: string) => BigInt('0x' + ipstring.replace(/\:+/g, ''));

abstract class IPMatcher {
	abstract match(ip: string): boolean;
};

class IPDirectMatcher extends IPMatcher {

	ip: string;

	constructor(ip: string) {
		super();
		this.ip = ip;
	}

	match(ip: string): boolean {
		if (ip.includes('/')) return false;
		return ip === this.ip;
	}
};

class IPv4CIDRMatcher extends IPMatcher {

	taget: bigint;
	boundLow: bigint;
	boundHigh: bigint;

	constructor(ip: string) {

		if (!/^(\d{1,3}\.){3}\d{1,3}\/\d{1,2}$/.test(ip))
			throw new Error(`"${ip}" is not a valid IPv4 address + CIDR notation`);

		super();

		this.taget = parseIPv4FromString(ip);

		const cidr = parseInt(ip.slice(ip.indexOf('/') + 1));

		if (isNaN(cidr) || cidr < 0 || cidr > 32)
			throw new Error(`IPv4 address "${ip}" has invalid CIDR notation`);

		const cidrMask = (BigInt(2) ** BigInt(32 - cidr)) - BigInt(1);
		const cidrAntiMask = (BigInt(-1)) ^ cidrMask;

		this.boundLow = this.taget & cidrAntiMask;
		this.boundHigh = this.taget | BigInt(cidrMask);
	}

	match(ip: string): boolean {
		if (!/^(\d{1,3}\.){3}\d{1,3}(\/\d{1,2})?$/.test(ip)) return false;
		const checking = parseIPv4FromString(ip);
		return (checking >= this.boundLow && checking <= this.boundHigh);
	}
};

class IPv6CIDRMatcher extends IPMatcher {

	taget: bigint;
	boundLow: bigint;
	boundHigh: bigint;

	constructor(ip: string) {

		if (!/^([a-f0-9]{1,4})?(\:[a-f0-9]{0,4}){1,7}(\/\d{1,2})?$/i.test(ip))
			throw new Error(`"${ip}" is not a valid IPv6 address + CIDR notation`);

		super();

		this.taget = parseIPv6FromString(ip);

		const cidr = parseInt(ip.slice(ip.indexOf('/') + 1));

		if (isNaN(cidr) || cidr < 0 || cidr > 64)
			throw new Error(`IPv6 address "${ip}" has invalid CIDR notation`);

		const cidrMask = (BigInt(2) ** BigInt(64 - cidr)) - BigInt(1);
		const cidrAntiMask = (BigInt(-1)) ^ cidrMask;

		this.boundLow = this.taget & cidrAntiMask;
		this.boundHigh = this.taget | BigInt(cidrMask);
	}

	match(ip: string): boolean {
		if (!/^([a-f0-9]{1,4})?(\:[a-f0-9]{0,4}){1,7}$/i.test(ip)) return false;
		const checking = parseIPv6FromString(ip);
		return (checking >= this.boundLow && checking <= this.boundHigh);
	}
};

class IPChecker {

	data: IPMatcher[];

	constructor(addresses: string[]) {

		this.data = addresses.map(item => {

			if (item.includes('/')) {
				return item.includes(':') ? new IPv6CIDRMatcher(item) : new IPv4CIDRMatcher(item) ;
			} else {
				return new IPDirectMatcher(item);
			}
		});
	}

	check(ip: string) {
		return this.data.some(item => item.match(ip));
	}
};

class IPListsPluginImpl implements MiddlewarePluginInstance {

	id = pluginID;
	console?: ServiceConsole;
	whitelistChecker?: IPChecker;
	blacklistChecker?: IPChecker;
	peerIP: string;

	constructor(init: {
		whitelistChecker?: IPChecker;
		blacklistChecker?: IPChecker;
		console?: ServiceConsole;
		peerIP: string;
	}) {
		this.whitelistChecker = init.whitelistChecker;
		this.blacklistChecker = init.blacklistChecker;
		this.peerIP = init.peerIP;
		this.console = init.console;
	}

	check(rqOrigin: string, allowedOrigins: string[]) {

		if (!rqOrigin) return false;

		let hostnameStart = rqOrigin.indexOf("://");
		if (hostnameStart === -1) return false;
		hostnameStart += 3;
		
		const portStart = rqOrigin.indexOf(':', hostnameStart);
		const pathStart = rqOrigin.indexOf('/', hostnameStart);
		
		let hostnameEnd: number | undefined = undefined;

		if (portStart !== -1) {
			hostnameEnd = portStart;
		} else if (pathStart !== -1) {
			hostnameEnd = pathStart;
		}

		const originHostname = rqOrigin.slice(hostnameStart, hostnameEnd);

		return allowedOrigins.some(domain => (
			originHostname === domain ||
			originHostname.endsWith(`.${domain}`)
		));
	}

	executeBefore() {

		const requestRejection = () => ({
			respondWith: new TypedResponse({
				error_text: 'access denied'
			}, { status: 511 }).toResponse()
		});

		const isWhitelisted = this.whitelistChecker?.check(this.peerIP);
		if (isWhitelisted) return null;

		const isBlacklisted = this.blacklistChecker?.check(this.peerIP);
		if (isBlacklisted) return requestRejection();

		if (this.whitelistChecker && !isWhitelisted && !this.blacklistChecker)
			return requestRejection();

		return null;
	}
};

interface InitParams {

	/**
	 * List of IPv4/IPv6 addresses or CIDR notations to allow access for
	 */
	whitelist?: string[];

	/**
	 * List of IPv4/IPv6 addresses or CIDR notations to block access for
	 */
	blacklist?: string[];
};

class IPListsPlugin implements MiddlewarePlugin {

	id = pluginID;
	whitelistChecker?: IPChecker;
	blacklistChecker?: IPChecker;

	constructor(init: InitParams) {
		this.whitelistChecker = init.whitelist ? new IPChecker(init.whitelist) : undefined;
		this.blacklistChecker = init.blacklist ? new IPChecker(init.blacklist) : undefined;
	}

	async spawn(props: SpawnProps) {

		const useLogging = props.middleware.config.loglevel?.plugins !== false;

		return new IPListsPluginImpl({
			whitelistChecker: this.whitelistChecker,
			blacklistChecker: this.blacklistChecker,
			peerIP: props.info.clientIP,
			console: useLogging ? props.console : undefined,
		});
	}
};

export const ipLists = (init: InitParams) => new IPListsPlugin(init);
