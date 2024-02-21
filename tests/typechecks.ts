
export const runTypeChecks = async (inputs: string[]) => {
	for (const input of inputs) {

		const execproc = new Deno.Command('deno', {
			args: ['check', input],
			stderr: 'inherit',
			stdout: 'inherit'
		}).spawn();
	
		const status = await execproc.status;
		if (!status.success) Deno.exit(status.code);
	}
};
