import { TypedFetchAgent } from "../lib/rest/fetch.ts";
import { Schema } from "./functions/typedapi.ts";

const response = await new TypedFetchAgent<Schema>({
	url: '/',
	data: {
		id: 'tset'
	},
	headers: {
		'x-captcha': 'test'
	}
}).fetch();

console.log(response.data.action);
