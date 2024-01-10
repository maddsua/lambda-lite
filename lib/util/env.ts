
export interface TypedEnvVariable {
	name: string;
	type?: 'string' | 'number' | 'boolean' | 'object';
	optional?: true | false;
};

//export type TypedEnv<T extends Record<string, TypedEnvVariable> = {}> = Record<keyof T, TypedEnvVariable>;

const schema = {
	testVar: {
		name: 'TESTVAR',
		type: 'number',
		optional: true
	}
};

const createEnv = <T extends Record<string, TypedEnvVariable> = {}>(schema: T, env: object) => {

	type Env = { [P in keyof T]: T[P]['optional'] extends true ? string | undefined : string; };

	const result: { [P in keyof T]: [P]; } = {};

	for (const key in schema) {

		const ctx = schema[key];
		const value = env[ctx.name as keyof typeof env];

		if (!value) {
			if (ctx.optional) continue;
			throw new Error(`[Typed Env]: Variable $${ctx.name} is not defined`);
		}

		let parsedValue: any = value;

		result[key as keyof typeof result] = parsedValue;
	}

	//type ResultingEnvType = { [P in keyof T]: T[P]['type']; };

	return result;
};

const env = createEnv(schema);
