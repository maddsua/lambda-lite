
export const recursiveReaddir = async (dir: string) => {

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
	await iterateDirectory(dir);

	return allEntries;
};

export const exists = async (entry: string) => Deno.stat(entry).then((_stat) => true).catch((_error) => false);
