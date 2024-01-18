import type { FetchSchema } from "../routes/schema.ts";

export class LambdaRequest <T extends FetchSchema<any>> extends Request {

	constructor(init: Request) {
		super(init);
	}

	async unwrap(): Promise<T['request']> {
		const { searchParams } = new URL(this.url);

		if (this.method === 'GET') return {
			headers: Object.fromEntries(this.headers.entries()),
			query: Object.fromEntries(searchParams.entries()),
		};
	
		const contentIsJSON = this.headers.get('content-type')?.toLowerCase()?.includes('json');
		const requestData = contentIsJSON ? await this.json().catch(() => null) : null;
		if (contentIsJSON && !requestData) throw new Error('Invalid typed request: no data');
	
		return {
			data: requestData,
			headers: Object.fromEntries(this.headers.entries()),
			query: Object.fromEntries(searchParams.entries())
		};
	}
};
