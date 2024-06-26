import { TypedResponse } from "../middleware/rest.ts";
import type { MiddlewarePlugin, MiddlewarePluginInstance, SpawnProps } from "../middleware/plugins.ts";
import type { ServiceConsole } from "../util/console.ts";

const pluginID = 'llp-service_auth';

const uint8sEqual = (a: Uint8Array, b: Uint8Array): boolean => {
	
	if (a.length !== b.length) return false;

	for (let idx = 0; idx < a.length; idx++) {
		if (a[idx] !== b[idx]) return false;
	}

	return true;
};

class ServiceAuthPluginImpl implements MiddlewarePluginInstance {

	id = pluginID;
	tokenHash: Uint8Array;
	fakeDelayRange?: number;
	console?: ServiceConsole;

	constructor(init: {
		tokenHash: Uint8Array;
		fakeDelayRange?: number;
		console?: ServiceConsole;
	}) {
		this.tokenHash = init.tokenHash;
		this.fakeDelayRange = init.fakeDelayRange;
		this.console = init.console;
	}

	async executeBefore(request: Request) {

		const authBearer = request.headers.get('authorization')?.replace(/^\s*bearer\s+/, '');
		if (!authBearer?.length) {
			return {
				respondWith: new TypedResponse({
					error_text: 'service access token is required'
				}, {
					status: 401,
					headers: {
						'WWW-Authenticate': 'Bearer realm="API"'
					}
				}).toResponse()
			};
		}

		const bearerHash = new Uint8Array(await crypto.subtle.digest('sha-256', new TextEncoder().encode(authBearer)));

		if (!uint8sEqual(bearerHash, this.tokenHash)) {

			if (this.fakeDelayRange) {
				const fakeDelayRange = this.fakeDelayRange;
				await new Promise(resolve => setTimeout(resolve, Math.floor(Math.random() * fakeDelayRange)));
			}

			this.console?.error(`[Service auth] Invalid service token provided (${authBearer})`);

			return {
				respondWith: new TypedResponse({
					error_text: 'invalid service access token'
				}, { status: 403 }).toResponse()
			};
		}

		return null;
	}
};

interface InitParams {

	/**
	 * Define service token
	 */
	token: string;

	/**
	 * Make a fake delay when client sends an invalid token.
	 * This options sets range in milliseconds,
	 * in which a fake delay would be randomly picked
	 */
	fakeDelayRange?: number;
};

class ServiceAuthPlugin implements MiddlewarePlugin {

	id = pluginID;
	tokenHash: Uint8Array | null;
	token: string;
	fakeDelayRange?: number;

	constructor(init: InitParams) {
		this.token = init.token;
		this.tokenHash = null;
		this.fakeDelayRange = init.fakeDelayRange;
	}

	async spawn(props: SpawnProps) {

		if (!this.tokenHash) {
			const hashBuffer = await crypto.subtle.digest('sha-256', new TextEncoder().encode(this.token));
			this.tokenHash = new Uint8Array(hashBuffer);
		}

		const useLogging = props.middleware.config.loglevel?.plugins !== false;

		return new ServiceAuthPluginImpl({
			tokenHash: this.tokenHash,
			fakeDelayRange: this.fakeDelayRange,
			console: useLogging ? props.console : undefined
		});
	}
}

export const serviceAuth = (init: InitParams) => new ServiceAuthPlugin(init);
