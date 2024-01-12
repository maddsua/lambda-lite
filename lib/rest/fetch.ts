import { TypedFetchRequest } from "../../deno.mod.ts";
import { unwrapResponse } from "./response.ts";
import { FetchSchema } from "./typed.ts";
import { TypedRequest } from "./request.ts";

export class TypedFetchAgent <T extends FetchSchema<any>> {

	url: string | URL;
	request: TypedFetchRequest;

	constructor(init: T['request'] & { url: string | URL }) {
		this.request = init;
		this.url = init.url;
	}

	async fetch() {

		const request = new TypedRequest(this.url, {
			headers: this.request.headers,
			data: this.request.data
		}).toRequest();

		const response = await fetch(request);

		return await unwrapResponse<T>(response);
	}
};
