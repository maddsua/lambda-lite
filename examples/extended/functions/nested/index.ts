import type { FunctionConfig } from "../../../../mod.ts";

export const config: FunctionConfig = {
	expand: true
};

export const handler = () => new Response("nested handler [/nested/index]\n this is a root path that expands into directory");
