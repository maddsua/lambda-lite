import type { ServiceConsole } from '../util/console.ts';
import type { LambdaMiddleware } from './middleware.ts';
import { LambdaContext } from './context.ts';

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

export interface MiddlewarePluginInstance {
	id: string;
	executeBefore?: (request: Request) => PluginBeforeReturnType;
	executeAfter?: (response: Response) => PluginAfterReturnType;
};

export interface SpawnProps extends LambdaContext {
	middleware: LambdaMiddleware;
};

export interface MiddlewarePlugin {
	id: string;
	spawn: (props: SpawnProps) => Promise<MiddlewarePluginInstance> | MiddlewarePluginInstance;
};
