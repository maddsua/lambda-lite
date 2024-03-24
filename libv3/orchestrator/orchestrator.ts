import type { RequestContext } from "../server/context.ts";
import type { WebServiceModule } from "./services.ts";
import type { WebServiceMap } from "./services.ts";

export class WebServiceOrchestartor {

	#m_services: WebServiceMap = {};

	hasService(uid: string): boolean {
		return !!this.#m_services[uid.toLowerCase()];
	}

	removeService(uid: string): void {
		const uidNormalized = uid.toLowerCase();
		delete this.#m_services[uidNormalized];
	}

	addService(uid: string, svcmodule: WebServiceModule) {

		const uidNormalized = uid.toLowerCase();
		if (this.#m_services[uidNormalized]) {
			throw new Error(`Service "${uidNormalized}" already exists`);
		}

		this.#m_services[uidNormalized] = Object.assign({}, svcmodule, {
			uid: uidNormalized,
		});
	}

	updateService(uid: string, svcmodule: WebServiceModule) {

		const uidNormalized = uid.toLowerCase();
		if (!this.#m_services[uidNormalized]) {
			throw new Error(`Service "${uidNormalized}" does not exists`);
		}

		this.#m_services[uidNormalized] = Object.assign({}, svcmodule, {
			uid: uidNormalized,
		});
	}

	async dispatchRequest (request: Request, context: RequestContext): Promise<Response> {
		return new Response();
	}
};
