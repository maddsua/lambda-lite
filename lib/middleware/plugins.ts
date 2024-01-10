import type { LambdaMiddleware } from './middleware.ts';

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
	middleware: LambdaMiddleware;
};

export type PluginCallback = (props: PluginProps) => PluginReturnType;

export interface MiddlewarePluginSequenceItem {
	callback: PluginCallback;
	sequernce?: 'after' | 'before';
};
