
export class MethodChecker {
	data: Set<string>;

	constructor(methods: string[]) {
		const methodsNormalized = methods.map(item => item.trim().toUpperCase()).filter(item => item.length);
		this.data = new Set(methodsNormalized);
	}

	check(method: string): boolean {
		return this.data.has(method.toUpperCase());
	}
};
