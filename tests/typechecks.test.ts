
const inputsList: string[] = [
	'lib.mod.ts',
	'adapters.mod.ts',
	'plugins.mod.ts'
];

for (const input of inputsList) {

	const execproc = new Deno.Command('deno', {
		args: ['check', input],
		stderr: 'inherit',
		stdout: 'inherit'
	}).spawn();

	const status = await execproc.status;
	if (!status.success) Deno.exit(status.code);
}
