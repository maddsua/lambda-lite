
export interface MiddlewarePluginOptions {
	paths?: string | RegExp;
	sequernce?: 'after' | 'before';
};

export type MiddlewarePlugin = () => Promise<Response | null>;
