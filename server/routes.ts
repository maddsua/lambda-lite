import { RateLimiterConfig } from "./accessControl.ts";
import type { RouteHandler } from "./api.ts";
import { importFileExtensions } from "./config.ts";

export interface RouteConfig {
	expand?: boolean;
	ratelimit?: RateLimiterConfig | null;
	allowedOrigings?: string[] | 'all';
};

export interface FileRouteConfig extends RouteConfig {
	url?: string;
};

export interface RouteCtx extends RouteConfig {
	handler: RouteHandler;
};
export type ServerRoutes = Record<`/${string}`, RouteCtx>;

export const loadFunctionsFromFS = async (fromDir: string): Promise<ServerRoutes> => {

	console.log(`\n%c Indexing functions in ${fromDir}... \n`, 'background-color: green; color: black');

	const allEntries: string[] = [];

	const iterateDirectory = async (dir: string) => {
		const nextEntries = Deno.readDir(dir);
		for await (const item of nextEntries) {
			const itemPath = `${dir}/${item.name}`;
			if (item.isDirectory) {
				await iterateDirectory(itemPath);
			} else if (item.isFile) {
				allEntries.push(itemPath);
			}
		}
	};
	await iterateDirectory(fromDir);

	const importEntries = allEntries.filter(item => importFileExtensions.some(ext => item.endsWith(`.${ext}`)));
	if (!importEntries.length) throw new Error(`Failed to load route functions: no modules found in "${fromDir}"`);

	const routes: ServerRoutes = {};

	for (const entry of importEntries) {

		try {

			const importPath = /^([A-z]\:)?[\\\/]/.test(entry) ? entry : `${Deno.cwd()}/${entry}`;
			const importURL = `file:///` + importPath.replace(/[\\\/]+/g, '/').replace(/\/[^\/]+\/[\.]{2}\//g, '/').replace(/\/\.\//g, '/');

			console.log(`%c --> Loading function %c${entry}\n\t (resolved: ${importURL})`, 'color: blue', 'color: white');

			const imported = await import(importURL);	
	
			const handler = (imported['default'] || imported['handler']);
			if (!handler || typeof handler !== 'function') throw new Error('No handler exported');
	
			const config = (imported['config'] || {}) as FileRouteConfig;
			if (typeof config !== 'object') throw new Error('Config invalid');

			const pathNoExt = entry.slice(fromDir.length, entry.lastIndexOf('.'));
			const indexIndex = pathNoExt.lastIndexOf('/index');
			const fsRoutedUrl = indexIndex === -1 ? pathNoExt : (indexIndex === 0 ? '/' : pathNoExt.slice(0, indexIndex));
			const customUrl = config.url?.replace(/[\/\*]+$/, '');

			const pathname = typeof customUrl === 'string' ? customUrl : fsRoutedUrl;
			if (!pathname.startsWith('/')) throw new Error(`Invalid route url: ${pathname}`);

			routes[pathname as keyof typeof routes] = Object.assign({}, config, { handler });

		} catch (error) {
			throw new Error(`Failed to import route module ${entry}: ${(error as Error | null)?.message}`);
		}
	}

	console.log(`%cLoaded ${allEntries.length} functions`, 'color: green')

	return routes;
};
