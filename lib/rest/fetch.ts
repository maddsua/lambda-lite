import { FetchSchema } from "./typed.ts";

export class TypedFetchAgent <T extends FetchSchema<any>> {

	request: T['request'];

	constructor(init: T['request'] & { url: string | URL }) {
		this.request = init;
	}

	async fetch(): Promise<T['response']> {
		return {};
	}
};
