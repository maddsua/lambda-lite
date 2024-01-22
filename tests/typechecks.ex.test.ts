import { recursiveReaddir } from "https://deno.land/x/recursive_readdir@v2.0.0/mod.ts";
import { runTypeChecks } from "./typechecks.ts";

const modulesMatch = /^[^\/]+\/[^\/]+\/[^\/]+\.ts$/;
const entries = await recursiveReaddir('examples');
const pathsNormalized = entries.map(item => item.replace(/[\\\/]+/g, '/'));
const inputsList = pathsNormalized.filter(item => modulesMatch.test(item));

await runTypeChecks(inputsList);
