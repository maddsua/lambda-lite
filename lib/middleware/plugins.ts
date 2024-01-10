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

export interface PluginBeforeProps {
	request: Request;
};

export interface PluginAfterProps {
	request: Request;
	response: Response;
};

export interface MiddlewarePluginBase {
	id: string;
	executeBefore?: (props: PluginBeforeProps) => PluginBeforeReturnType;
	executeAfter?: (props: PluginAfterProps) => PluginAfterReturnType;
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
