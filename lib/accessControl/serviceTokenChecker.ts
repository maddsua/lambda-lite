
export class ServiceTokenChecker {
	token: string;
	fakeDelayRange: number;

	constructor(token: string, fakeDelayRange?: number) {
		this.token = token;
		this.fakeDelayRange = fakeDelayRange || 2500;
	}

	async check(input: Headers | string): Promise<boolean> {
		const authString = typeof input === 'string' ? input : input.get('authorization')?.replace(/^bearer\s+/i, '');
		
		if (authString != this.token) {
			await new Promise(resolve => setTimeout(resolve, Math.floor(Math.random() * this.fakeDelayRange)));
			return false;
		}

		return true;
	}
};
