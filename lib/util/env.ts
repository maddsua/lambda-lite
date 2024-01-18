
type EnvVariableValueType = 'string' | 'number' | 'boolean' | 'object';

interface TypedEnvVariableCtx {
	name: string;
	type?: EnvVariableValueType | 'comma-separated';
	optional?: true | false;
};

type EnvValueTypeToType<T extends TypedEnvVariableCtx['type']> = T extends 'string' ? string :
	T extends 'number' ? number :
	T extends 'boolean' ? boolean :
	T extends 'object' ? object :
	T extends 'extended-string' ? string[] :
	string;

export type TypedEnv = Record<string, TypedEnvVariableCtx>;

type SchemaType<T extends TypedEnv> = {
	[K in keyof T]: T[K]['optional'] extends true ? EnvValueTypeToType<T[K]['type']> | undefined : EnvValueTypeToType<T[K]['type']>;
};

export const createEnv = <T extends TypedEnv>(schema: T, env: Record<string, string>) => {

	const result: Record<string, any> = {};

	for (const key in schema) {

		const ctx = schema[key];
		const value = env[ctx.name]?.trim();

		if (!value) {
			if (ctx.optional) continue;
			throw new Error(`[Typed Env]: Variable $${ctx.name} is not defined`);
		}

		try {

			if (ctx.type === 'comma-separated') {
				result[key] = value.split(',').map(item => item.trim()).filter(item => item.length);;
			} else if (!ctx.type || ctx.type === 'string') {
				result[key] = value;
			} else {
				result[key] = JSON.parse(value);
			}

		} catch (_error) {
			throw new Error(`[Typed Env]: Failed to parse variable $${ctx.name}`);
		}
	}

	return result as SchemaType<typeof schema>;
};
