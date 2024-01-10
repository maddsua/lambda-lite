import { JSONResponse } from "../rest/jsonResponse.ts";
import type { PluginGenerator, MiddlewarePluginBase, PluginBeforeProps, SpawnProps } from "../middleware/plugins.ts";
import type { ServiceConsole } from "../util/console.ts";

const pluginID = 'lambda_lite-plugin-service_token_checker';

const uint8sEqual = (a: Uint8Array, b: Uint8Array): boolean => {
	
	if (a.length !== b.length) return false;

	for (let idx = 0; idx < a.length; idx++) {
		if (a[idx] !== b[idx]) return false;
	}

	return true;
};

class ServiceTokenCheckerPluginImpl implements MiddlewarePluginBase {

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

	async executeBefore(props: PluginBeforeProps) {

		const authBearer = props.request.headers.get('authorization')?.replace(/^\s*bearer\s+/, '');
		if (!authBearer?.length) {
			return {
				respondWith: new JSONResponse({
					error_text: 'service access token is required'
				}, {
					status: 401,
					headers: {
						'WWW-Authenticate': 'Basic realm="API"'
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

			this.console?.error(`Invalid service token provided (${authBearer})`);

			return {
				respondWith: new JSONResponse({
					error_text: 'invalid service access token'
				}, { status: 403 }).toResponse()
			};
		}

		return null;
	}
};

interface InitParams {
	token: string;
	fakeDelayRange?: number;
	useLogs?: boolean;
};

class ServiceTokenCheckerPlugin implements PluginGenerator {

	id = pluginID;
	tokenHash: Uint8Array | null;
	token: string;
	fakeDelayRange?: number;
	useLogs?: boolean;

	constructor(init: InitParams) {
		this.token = init.token;
		this.tokenHash = null;
		this.fakeDelayRange = init.fakeDelayRange;
		this.useLogs = init.useLogs;
	}

	async spawn(props: SpawnProps) {

		if (!this.tokenHash) {
			const hashBuffer = await crypto.subtle.digest('sha-256', new TextEncoder().encode(this.token));
			this.tokenHash = new Uint8Array(hashBuffer);
		}

		const middlewareLogPlugins = props.middleware.config.loglevel?.plugins;
		const useLogging = typeof middlewareLogPlugins === 'boolean' ? middlewareLogPlugins : this.useLogs;

		return new ServiceTokenCheckerPluginImpl({
			tokenHash: this.tokenHash,
			fakeDelayRange: this.fakeDelayRange,
			console: useLogging ? props.console : undefined
		});
	}
}

export const serviceTokenChecker = (init: InitParams) => new ServiceTokenCheckerPlugin(init);
