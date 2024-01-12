
interface TypedRESTFlags {
	non_null?: boolean;
};

export const serializeFlags = (init: TypedRESTFlags) => {

	const flagsArray: string[] = [];

	for (const key in init) {
		if (!init[key as keyof TypedRESTFlags]) continue;
		flagsArray.push(key);
	}

	return flagsArray.join(',');
};

export const parseFlags = (init: string | null) => {

	if (!init) return {};

	const flagsArray = init.split(',').map(item => item.trim()).filter(item => item.length);
	const result: Record<string, boolean> = {};

	for (const flag of flagsArray) {
		result[flag] = true;
	}

	return result as TypedRESTFlags;
};
