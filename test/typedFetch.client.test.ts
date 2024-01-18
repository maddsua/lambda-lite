import { typedFetch } from "../lib/client/fetch.ts";
import { Schema } from "./functions/typedapi.ts";

const response = await typedFetch<Schema>('http://localhost:8080/typedapi', {
	data: {
		id: 'test id'
	},
	headers: {
		'x-captcha': 'test'
	}
});

console.log(response.data.action);
