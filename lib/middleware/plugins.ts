import type { LambdaMiddleware } from './middleware.ts';
import type { RequestInfo } from './route.ts';

interface PluginBeforeResult {
	modifiedRequest?: Request;
	overrideResponse?: Response;
};

type PluginBeforeReturnTypeIntm = PluginBeforeResult | null | undefined;
type PluginBeforeReturnType = Promise<PluginBeforeReturnTypeIntm> | PluginBeforeReturnTypeIntm;

interface PluginAfterResult {
	overrideResponse?: Response;
	chainable?: boolean;
};

type PluginAfterReturnTypeIntm = PluginAfterResult | null | undefined;
type PluginAfterReturnType = Promise<PluginAfterReturnTypeIntm> | PluginAfterReturnTypeIntm;

interface PluginBeforeProps {
	request: Request;
	info: RequestInfo;
	middleware: LambdaMiddleware;
};

interface PluginAfterProps {
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
