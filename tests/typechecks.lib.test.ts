
import { runTypeChecks } from "./typechecks.ts";

const inputsList: string[] = [
	'lib.mod.ts',
	'adapters.mod.ts',
	'plugins.mod.ts'
];

await runTypeChecks(inputsList);
