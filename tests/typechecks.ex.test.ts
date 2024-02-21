import { recursiveReaddir } from "../lib/functions/fsops.ts";
import { runTypeChecks } from "./typechecks.ts";

const modulesMatch = /^[^\/]+\/[^\/]+\/[^\/]+\.ts$/;
const entries = await recursiveReaddir('examples');
const pathsNormalized = entries.map(item => item.replace(/[\\\/]+/g, '/'));
const inputsList = pathsNormalized.filter(item => modulesMatch.test(item));

await runTypeChecks(inputsList);
