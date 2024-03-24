
const listener = Deno.listen({
	port: 8139
});

for await (const tcpconn of listener) {

	(async () => {
		const httpConn = Deno.serveHttp(tcpconn);
		for await (const requestEvent of httpConn) {
			await requestEvent.respondWith(
				new Response("hello world", {
					status: 200,
				}),
			);
		}
	})();
}
