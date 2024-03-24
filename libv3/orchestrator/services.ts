import type { HandlerFunction } from "../handlers/handlers.ts";

export interface WebServiceModule {
	handler: HandlerFunction;
	deploymentID: string;
	env: Record<string, string>;
	//	to be expanded later
};

export interface WebServiceContext extends WebServiceModule {
	uid: string;
};

export type WebServiceMap = Record<string, WebServiceContext>;
