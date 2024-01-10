import type { LambdaMiddleware } from './middleware.ts';
import type { RequestInfo } from './route.ts';

export interface PluginResult {
	modifiedRequest?: Request;
	response?: Response;
	chainable?: boolean;
};

type PluginReturnTypeIntm = PluginResult | null | undefined;
type PluginReturnType = Promise<PluginReturnTypeIntm> | PluginReturnTypeIntm

export type MiddlewarePluginResult = PluginResult | null | undefined;

export interface PluginProps {
	request: Request;
	response: Response | null;
	info: RequestInfo;
	middleware: LambdaMiddleware;
};

export interface MiddlewarePlugin {
	id: string;
	execute: (props: PluginProps) => PluginReturnType;
};

export interface MiddlewarePluginSequenceItem {
	instance: MiddlewarePlugin;
	sequernce?: 'after' | 'before';
};

export type MiddlewarePlugins = MiddlewarePluginSequenceItem[];
