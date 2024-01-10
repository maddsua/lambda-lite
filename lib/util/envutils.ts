
export const getNumber = (envVar: string | null | undefined, fallback?: number): number | undefined => {
	if (!envVar?.length) return typeof fallback === 'number' ? fallback : undefined;
	const temp = parseFloat(envVar);
	if (isNaN(temp)) return typeof fallback === 'number' ? fallback : undefined;
	return temp;
};

export const getBool = (envVar: string | null | undefined, fallback?: boolean): boolean | undefined => {
	if (!envVar?.length) return typeof fallback === 'boolean' ? fallback : undefined;
	return envVar.toLowerCase().trim() === 'true';
}

export const getSeparatedList = (envVar: string | null | undefined, token?: string): string[] | undefined =>  {
	if (!envVar?.length) return undefined;
	return envVar.split(token || ',').map(item => item.trim()).filter(item => item.length);
};

export const getCommaSeparated = (envVar: string | null | undefined): string[] | undefined => getSeparatedList(envVar);
