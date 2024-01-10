import { JSONResponse } from "../rest/jsonResponse.ts";
import type { PluginGenerator, MiddlewarePluginBase, SpawnProps } from "../middleware/plugins.ts";
import type { ServiceConsole } from "../util/console.ts";

const pluginID = 'lambda_lite-plugin-cors';

class CorsPluginImpl implements MiddlewarePluginBase {

	id = pluginID;
	allowedOrigins: string[] | 'all';
	console?: ServiceConsole;
	setAllowOrigin: string | null;

	constructor(init: {
		allowedOrigins: string[] | 'all';
		console?: ServiceConsole;
	}) {
		this.allowedOrigins = init.allowedOrigins;
		this.setAllowOrigin = null;
		this.console = init.console;
	}

	check(rqOrigin: string, allowedOrigins: string[]) {

		if (!rqOrigin) return false;

		let hostnameStart = rqOrigin.indexOf("://");
		if (hostnameStart === -1) return false;
		hostnameStart += 3;
		
		const portStart = rqOrigin.indexOf(':', hostnameStart);
		const pathStart = rqOrigin.indexOf('/', hostnameStart);
		
		let hostnameEnd: number | undefined = undefined;

		if (portStart !== -1) {
			hostnameEnd = portStart;
		} else if (pathStart !== -1) {
			hostnameEnd = pathStart;
		}

		const originHostname = rqOrigin.slice(hostnameStart, hostnameEnd);

		return allowedOrigins.some(domain => (
			originHostname === domain ||
			originHostname.endsWith(`.${domain}`)
		));
	}

	executeBefore(request: Request) {

		const requestOrigin = request.headers.get('origin');

		if (this.allowedOrigins === 'all' || !this.allowedOrigins.length) {
			this.setAllowOrigin = requestOrigin ? requestOrigin : '*';
			return null;
		}

		if (!requestOrigin) {

			return {
				respondWith: new JSONResponse({
					error_text: 'client verification required'
				}, { status: 403 }).toResponse()
			};

		} else if (!this.check(requestOrigin, this.allowedOrigins)) {

			this.console?.log('Origin not allowed:', requestOrigin);

			return {
				respondWith: new JSONResponse({
					error_text: 'client not verified'
				}, { status: 403 }).toResponse()
			};
		}

		//	respond to CORS preflight
		if (request.method == 'OPTIONS') {

			const requestedCorsHeaders = request.headers.get('Access-Control-Request-Headers');
			const defaultCorsHeaders = 'Origin, X-Requested-With, Content-Type, Accept';

			const requestedCorsMethod = request.headers.get('Access-Control-Request-Method');
			const defaultCorsMethods = 'GET, POST, PUT, OPTIONS, DELETE';

			const preflightHeaders = {
				'Access-Control-Allow-Methods': requestedCorsMethod || defaultCorsMethods,
				'Access-Control-Allow-Headers': requestedCorsHeaders || defaultCorsHeaders,
				'Access-Control-Max-Age': '3600',
				'Access-Control-Allow-Credentials': 'true'
			};

			return {
				respondWith: new Response(null, {
					status: 204,
					headers: preflightHeaders
				})
			};
		}

		this.setAllowOrigin = requestOrigin;

		return null;
	}

	executeAfter(response: Response) {
		if (this.setAllowOrigin) response.headers.set('Access-Control-Allow-Origin', this.setAllowOrigin);
		return null;
	}
};

interface InitParams {
	allowOrigins: string[] | 'all';
};

class CorsPlugin implements PluginGenerator {

	id = pluginID;
	allowedOrigins: string[] | 'all';

	constructor(init: InitParams) {

		this.allowedOrigins = [];

		if (typeof init.allowOrigins !== 'string') {

			for (const entry of init.allowOrigins) {
	
				if (!entry.includes('://')) {
					this.allowedOrigins.push(entry);
					continue;
				}
	
				try {
					this.allowedOrigins.push(new URL(entry).hostname);
				} catch (error) {
					console.error(`Invalid origin string: "${entry}"`);
				}
			}

		} else {
			this.allowedOrigins = init.allowOrigins;
		}
	}

	async spawn(props: SpawnProps) {

		const useLogging = props.middleware.config.loglevel?.plugins !== false;

		return new CorsPluginImpl({
			allowedOrigins: this.allowedOrigins,
			console: useLogging ? props.console : undefined
		});
	}
}

export const cors = (init: InitParams) => new CorsPlugin(init);
