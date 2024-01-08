import type { RouteConfig } from "../../../deno.mod.ts";

export const config: RouteConfig = {
	expand: true
};

export const handler = () => new Response("nested handler [/nested/index]\n this is a root path that expands into directory");
