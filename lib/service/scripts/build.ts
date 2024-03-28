import { encodeBase64 } from "https://deno.land/std@0.207.0/encoding/base64.ts";
import { type WorkerContext, packGlobalContext } from "./modules.ts";

export const transformWorker = async (source: ArrayBuffer, ctx: WorkerContext): Promise<ArrayBuffer> => {

	const injectLines = [
		packGlobalContext(ctx),
		`const Deno = undefined;`,
	];

	return await new Blob([
		'data:text/javascript;base64,',
		encodeBase64(await new Blob([
			injectLines.join('\n\n'),
			'\n',
			source,
		]).arrayBuffer())
	]).arrayBuffer();
};
