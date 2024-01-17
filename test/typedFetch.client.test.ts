import { typedFetch } from "../lib/rest/fetch.ts";
import { Schema } from "./functions/typedapi.ts";

const response = await typedFetch<Schema>({
	url: 'http://localhost:8080/typedapi',
	data: {
		id: 'test id'
	},
	headers: {
		'x-captcha': 'test'
	}
});

console.log(response.data.action);