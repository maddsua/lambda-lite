import { recursiveReaddir, exists } from '../polyfills/fsops.ts';
import type { FunctionConfig } from './options.ts';
import type { FunctionsRouter } from '../middleware/router.ts';

const importFileExtensions = ['ts','mts','js','mjs'] as const;

export interface FunctionLoaderProps {
	dir: string;
	ignore?: RegExp[];
};

export const loadFunctionsFromFS = async (props: FunctionLoaderProps): Promise<FunctionsRouter> => {

	//	check that directory exists
	if (!await exists(props.dir)) {
		console.error(
			`\n%c Functions directory not found %c\nPath "${props.dir}" doesn't exist\n`,
			'background-color: red; color: white',
			'background-color: inherit; color: inherit'
		);
		throw new Error('no functions directory found');
	}

	console.log(`\n%c Indexing functions in ${props.dir}... \n`, 'background-color: green; color: black');

	const functionsDirEntries = await recursiveReaddir(props.dir);
	const moduleImportList = functionsDirEntries.filter(item => (
		importFileExtensions.some(ext => item.endsWith(`.${ext}`)) &&
		!props.ignore?.some(ignoreItem => ignoreItem.test(item))
	));

	if (!moduleImportList.length) {
		console.error(
			`%c Failed to load functions %c\nNo modules found in "${props.dir}"\n`,
			'background-color: red; color: white',
			'background-color: inherit; color: inherit'
		);
		throw new Error('no modules found');
	}

	const result: FunctionsRouter = {};

	for (const entry of moduleImportList) {

		try {

			const importPath = /^([^:]\:)?[\\\/]+/.test(entry) ? entry : `${Deno.cwd()}/${entry}`;
			const importURL = `file:///` + importPath.replace(/[\\\/]+/g, '/').replace(/\/[^\/]+\/[\.]{2}\//g, '/').replace(/\/\.\//g, '/');

			console.log(`%c --> Loading function: %c${entry}`, 'color: blue', 'color: white');

			const imported = await import(importURL);	
	
			const handler = (imported['default'] || imported['handler']);
			if (!handler || typeof handler !== 'function') throw new Error('No handler exported');
	
			const options = (imported['config'] || {}) as FunctionConfig;
			if (typeof options !== 'object') throw new Error('Config invalid');

			const pathNoExt = entry.slice(props.dir.length, entry.lastIndexOf('.'));
			const indexIndex = pathNoExt.lastIndexOf('/index');
			const fsRoutedUrl = indexIndex === -1 ? pathNoExt : (indexIndex === 0 ? '/' : pathNoExt.slice(0, indexIndex));

			result[fsRoutedUrl as keyof typeof result] = { handler, options };

		} catch (error) {
			throw new Error(`Failed to import route module ${entry}: ${(error as Error | null)?.message}`);
		}
	}

	console.log(`\n%cLoaded ${moduleImportList.length} functions`, 'color: green')

	return result;
};
