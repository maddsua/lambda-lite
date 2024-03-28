
export const compressResponse = async (req: Request, resp: Response): Promise<Response | null> => {

	const acceptEncodings = req.headers.get('accept-encoding');
	if (!acceptEncodings?.length) return null;

	if (acceptEncodings.includes('gzip')) {

		const readable = await resp.blob()
			.then(data => data.stream())
			.then(stream => stream.pipeThrough(new CompressionStream('gzip')));

		const response = new Response(readable, {
			status: resp.status,
			headers: resp.headers
		});

		response.headers.set('content-encoding', 'gzip');

		return response;
	}

	return null;
};
