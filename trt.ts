import { TypedResponse, responseToTyped } from "./lib/rest/response.ts";

const response = new TypedResponse({ value: 23.7 });

console.log(response);

const serialized = response.toResponse();

console.log(serialized.headers);

const restored = await responseToTyped<typeof response>(serialized);

console.log(restored);


interface TypedRouteResponse {
	data?: object;
	headers?: Record<string, string>;
	status?: number;
};

const typedRouter = {
	'/': {
		handler: () => ({ data: { value: 18 } })
	}
};

const funcThatAcceptsRouter = (router: Record<string, { handler: () => TypedRouteResponse }>) => null;

funcThatAcceptsRouter(typedRouter);

type RouterType = typeof typedRouter;
