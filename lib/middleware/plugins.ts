import { ServiceConsole } from '../util/console.ts';
import type { LambdaMiddleware } from './middleware.ts';
import type { RequestInfo } from './route.ts';

interface PluginBeforeResult {
	modifiedRequest?: Request;
	respondWith?: Response;
	chainable?: boolean;
};

type PluginBeforeReturnTypeIntm = PluginBeforeResult | null;
type PluginBeforeReturnType = Promise<PluginBeforeReturnTypeIntm> | PluginBeforeReturnTypeIntm;

interface PluginAfterResult {
	overrideResponse?: Response;
	chainable?: boolean;
};

type PluginAfterReturnTypeIntm = PluginAfterResult | null;
type PluginAfterReturnType = Promise<PluginAfterReturnTypeIntm> | PluginAfterReturnTypeIntm;

export interface MiddlewarePluginBase {
	id: string;
	executeBefore?: (request: Request) => PluginBeforeReturnType;
	executeAfter?: (response: Response) => PluginAfterReturnType;
};

export interface SpawnProps {
	info: RequestInfo;
	middleware: LambdaMiddleware;
	console: ServiceConsole;
};

export interface PluginGenerator {
	id: string;
	spawn: (props: SpawnProps) => Promise<MiddlewarePluginBase> | MiddlewarePluginBase;
};
