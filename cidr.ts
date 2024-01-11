
const parseIPv4FromString = (ipstring: string) => {

	const blocks = ipstring.replace(/[^\d\.]+/g, '').split('.').map(item => parseInt(item));
	if (blocks.length !== 4 || blocks.some(item => isNaN(item)))
		throw new Error(`IPv4 address "${ipstring}" is not valid`);

	return ((BigInt(blocks[0]) << BigInt(24)) | (BigInt(blocks[1]) << BigInt(16)) | (BigInt(blocks[2]) << BigInt(8)) | BigInt(blocks[3]));
};

abstract class IPMatcher {
	abstract match(ip: string): boolean;
}

abstract class IPv4Matcher extends IPMatcher {
	isIPv4(ip: string) {
		return /^(\d{1,3}\.){3}\d{1,3}(\/\d{1,2})?$/.test(ip);
	}
};

class IPv4CIDRMatcher extends IPv4Matcher {

	taget: bigint;
	boundLow: bigint;
	boundHigh: bigint;

	constructor(ip: string) {

		if (!/^(\d{1,3}\.){3}\d{1,3}\/\d{1,2}$/.test(ip))
			throw new Error(`"${ip}" is not an IPv4 address + CIDR`);

		super();

		this.taget = parseIPv4FromString(ip);

		const cidr = parseInt(ip.slice(ip.indexOf('/') + 1));
		if (isNaN(cidr)) throw new Error(`IPv4 address "${ip}" has invalid CIDR notation`);

		const cidrMask = (BigInt(2) ** BigInt(32-cidr)) - BigInt(1);
		const cidrAntiMask = (BigInt(-1)) ^ cidrMask;

		this.boundLow = this.taget & cidrAntiMask;
		this.boundHigh = this.taget | BigInt(cidrMask);
	}

	match(ip: string): boolean {
		if (!this.isIPv4(ip)) return false;
		const checking = parseIPv4FromString(ip);
		return (checking >= this.boundLow && checking <= this.boundHigh);
	}
};
