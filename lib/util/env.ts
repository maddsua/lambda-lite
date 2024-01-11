
type EnvVariableValueType = 'string' | 'number' | 'boolean' | 'object';

export interface TypedEnvVariableCtx {
	name: string;
	type?: EnvVariableValueType;
	optional?: true | false;
};

export type TypedEnvBase = Record<string, TypedEnvVariableCtx>;

type EnvValueTypeToType<T extends TypedEnvVariableCtx['type']> = T extends 'string' ? string 
	: T extends 'number' ? number
	: T extends 'boolean' ? boolean
	: T extends 'object' ? object
	: string;

type SchemaType<T extends TypedEnvBase> = {
	[K in keyof T]: T[K]['optional'] extends true ? EnvValueTypeToType<T[K]['type']> | undefined : EnvValueTypeToType<T[K]['type']>;
};

export const createEnv = <T extends TypedEnvBase>(schema: T, env: Record<string, string>) => {

	const result: Record<string, any> = {};

	for (const key in schema) {

		const ctx = schema[key];
		const value = env[ctx.name]?.trim();

		if (!value) {
			if (ctx.optional) continue;
			throw new Error(`[Typed Env]: Variable $${ctx.name} is not defined`);
		}

		try {
			result[key] = (!ctx.type || ctx.type === 'string') ? value : JSON.parse(value);
		} catch (_error) {
			throw new Error(`[Typed Env]: Failed to parse variable $${ctx.name}`);
		}
	}

	return result as SchemaType<typeof schema>;
};
