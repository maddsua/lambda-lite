import { TypedFetchRequest } from "../../deno.mod.ts";
import { unwrapResponse } from "./response.ts";
import { FetchSchema } from "./typed.ts";

export class TypedFetchAgent <T extends FetchSchema<any>> {

	request: TypedFetchRequest;
	url: string | URL;

	constructor(init: T['request'] & { url: string | URL }) {
		this.request = init;
		this.url = init.url;
	}

	async fetch() {

		const response = await fetch(this.url, {
			method: this.request.data ? 'POST' : 'GET',
			headers: this.request.headers,
			body: this.request.data ? JSON.stringify(this.request.data) : undefined
		});

		return await unwrapResponse<T>(response);
	}
};
