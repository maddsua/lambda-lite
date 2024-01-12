import { TypedResponse, responseToTyped } from "./lib/rest/response.ts";

const response = new TypedResponse({ value: 23.7 });

console.log(response);

const serialized = response.toResponse();

console.log(serialized.headers);

const restored = await responseToTyped<typeof response>(serialized);

console.log(restored);
