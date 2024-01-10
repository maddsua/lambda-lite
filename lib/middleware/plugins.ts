import type { LambdaMiddleware } from './middleware.ts';
import type { RequestInfo } from './route.ts';

interface PluginBeforeResult {
	modifiedRequest?: Request;
	overrideResponse?: Response;
};

type PluginBeforeReturnTypeIntm = PluginBeforeResult | null;
type PluginBeforeReturnType = Promise<PluginBeforeReturnTypeIntm> | PluginBeforeReturnTypeIntm;

interface PluginAfterResult {
	overrideResponse?: Response;
	chainable?: boolean;
};

type PluginAfterReturnTypeIntm = PluginAfterResult | null;
type PluginAfterReturnType = Promise<PluginAfterReturnTypeIntm> | PluginAfterReturnTypeIntm;

export interface PluginBeforeProps {
	request: Request;
	info: RequestInfo;
	middleware: LambdaMiddleware;
};

export interface PluginAfterProps {
	request: Request;
	info: RequestInfo;
	response: Response;
	middleware: LambdaMiddleware;
};

export interface MiddlewarePluginBase {
	id: string;
	executeBefore?: (props: PluginBeforeProps) => PluginBeforeReturnType;
	executeAfter?: (props: PluginAfterProps) => PluginAfterReturnType;
};

export interface PluginGenerator {
	id: string;
	spawn: () => MiddlewarePluginBase;
};
