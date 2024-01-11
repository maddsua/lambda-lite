
const array = new Uint8Array([192, 168, 2, 1]);

type IPv4SegmentsType = [number, number, number, number];
const ipv4ToInt = (ipv4: IPv4SegmentsType) => (BigInt(ipv4[0]) << BigInt(24)) | (BigInt(ipv4[1]) << BigInt(16)) | (BigInt(ipv4[2]) << BigInt(8)) | BigInt(ipv4[3]);

const assembledValue = ipv4ToInt([2, 121, 48, 50]);

const cidr = 25;
const cidrMask = (BigInt(2) ** BigInt(32-cidr)) - BigInt(1);
const cidrAntiMask = (BigInt(-1)) ^ cidrMask;

console.log('mask:', cidrMask.toString(2));
console.log('anti mask:', cidrAntiMask.toString(2));

const ipReal = assembledValue;
const boundLow = assembledValue & cidrAntiMask;
const boundHigh = assembledValue | BigInt(cidrMask);

console.log('low:', boundLow, (boundLow).toString(2));
console.log('ip:', ipReal, ipReal.toString(2));
console.log('high:', boundHigh, boundHigh.toString(2));

console.log(boundHigh - ipReal);
console.log(boundHigh - boundLow);
console.log(ipReal - boundLow);

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

		super();

		this.taget = parseIPv4FromString(ip);

		const cidr = 25;
		const cidrMask = (BigInt(2) ** BigInt(32-cidr)) - BigInt(1);
		const cidrAntiMask = (BigInt(-1)) ^ cidrMask;

		this.boundLow = assembledValue & cidrAntiMask;
		this.boundHigh = assembledValue | BigInt(cidrMask);
	}

	match(ip: string): boolean {
		if (!this.isIPv4(ip)) return false;
		const checking = parseIPv4FromString(ip);
		return (checking >= this.boundLow && checking <= this.boundHigh);
	}
};
