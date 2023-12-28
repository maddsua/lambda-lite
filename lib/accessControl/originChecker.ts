
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
		
		let hostnameEnd: number | undefined = undefined;

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
