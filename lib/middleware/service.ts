
export const getRequestIdFromProxy = (headers: Headers, headerName: string | null | undefined) => {
	if (!headerName) return undefined;
	const header = headers.get(headerName);
	if (!header) return undefined;
	const shortid = header.slice(0, header.indexOf('-'));
	return shortid.length <= 8 ? shortid : shortid.slice(0, 8);
};

export const generateRequestId = () => {
	const characters = '0123456789abcdef';
	const randomChar = () => characters.charAt(Math.floor(Math.random() * characters.length));
	return Array.apply(null, Array(8)).map(randomChar).join('');
};
