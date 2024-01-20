import { existsSync } from "https://deno.land/std@0.212.0/fs/mod.ts";
import type { BasicRouter } from '../../middleware/router.ts';
import type { RouteConfig } from "../../routes/route.ts";

interface FileRouteConfig extends RouteConfig {
	url?: string;
};

export interface FunctionLoaderProps {
	dir: string;
	ignore?: RegExp[];
};

export const loadFunctionsFromFS = async (props: FunctionLoaderProps): Promise<BasicRouter> => {

	//	check that directory exists
	if (!existsSync(props.dir)) {
		console.error(
			`\n%c Functions directory not found %c\nPath "${props.dir}" doesn't exist\n`,
			'background-color: red; color: white',
			'background-color: inherit; color: inherit'
		);
		throw new Error('no functions directory found');
	}

	console.log(`\n%c Indexing functions in ${props.dir}... \n`, 'background-color: green; color: black');

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
	await iterateDirectory(props.dir);

	const importFileExtensions = ['ts','mts','js','mjs'] as const;
	const importEntries = allEntries.filter(item => (
		importFileExtensions.some(ext => item.endsWith(`.${ext}`)) &&
		!props.ignore?.some(ignoreItem => ignoreItem.test(item))
	));

	if (!importEntries.length) {
		console.error(
			`%c Failed to load route functions %c\nNo modules found in "${props.dir}"\n`,
			'background-color: red; color: white',
			'background-color: inherit; color: inherit'
		);
		throw new Error('no modules found');
	}

	const routes: BasicRouter = {};

	for (const entry of importEntries) {

		try {

			const importPath = /^([^:]\:)?[\\\/]+/.test(entry) ? entry : `${Deno.cwd()}/${entry}`;
			const importURL = `file:///` + importPath.replace(/[\\\/]+/g, '/').replace(/\/[^\/]+\/[\.]{2}\//g, '/').replace(/\/\.\//g, '/');

			console.log(`%c --> Loading function: %c${entry}`, 'color: blue', 'color: white');

			const imported = await import(importURL);	
	
			const handler = (imported['default'] || imported['handler']);
			if (!handler || typeof handler !== 'function') throw new Error('No handler exported');
	
			const config = (imported['config'] || {}) as FileRouteConfig;
			if (typeof config !== 'object') throw new Error('Config invalid');

			const pathNoExt = entry.slice(props.dir.length, entry.lastIndexOf('.'));
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

	console.log(`\n%cLoaded ${allEntries.length} functions`, 'color: green')

	return routes;
};
