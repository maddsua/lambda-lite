
export const handler = () => new Response(JSON.stringify({
	success: true,
	purpose: 'imitates a REST API',
	action: 'use your imagination'
}), {
	headers: {
		'content-type': 'application/json'
	}
});
