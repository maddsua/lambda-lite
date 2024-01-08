
interface TypedEnvEntry {
	name: string;
	optional?: boolean;
};

type TypedEnv = Record<string, TypedEnvEntry>;

const envSchema = {
	data: {
		name: 'var_name',
		optional: true
	},
	data2: {
		name: 'var_name2',
		optional: false
	},
} as const;

type InferEnvType <T extends TypedEnv> = Record<keyof T, T[keyof T]['optional'] extends true ? (string | undefined) : string>;

type Env = InferEnvType<typeof envSchema>;
