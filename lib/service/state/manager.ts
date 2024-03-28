import { DB } from "https://deno.land/x/sqlite@v3.8/mod.ts";
import { existsSync } from "https://deno.land/std@0.221.0/fs/exists.ts";

import type { DeployInit, WorkerInit, WorkerRecord, DeployRecord, DeployMetadata, WorkerMetadata, ActiveDeployEntry } from "./schema.ts";
import { ManagerHooks } from "./hooks.ts";
import { transformWorker } from "../scripts/build.ts";
import { envfield } from "./transforms.ts";

export class StateManager {

	readonly m_root: string;
	readonly m_dbpath: string;
	m_db: DB;
	readonly m_hooks: ManagerHooks;

	constructor(root: string, hooks: ManagerHooks) {

		this.m_hooks = hooks;

		if (!existsSync(root)) {
			Deno.mkdirSync(root, { recursive: true });
		}

		this.m_root = root;
		this.m_dbpath = `${this.m_root}/octo.db`;

		this.m_db = new DB(this.m_dbpath);

		this.m_db.execute(`
			CREATE TABLE IF NOT EXISTS workers (
				uid TEXT PRIMARY KEY,
				name TEXT NOT NULL CHECK(length(trim(name)) >= 4),
				active_deploy TEXT,

				UNIQUE(name),
				FOREIGN KEY (active_deploy) REFERENCES deploys(uid) ON DELETE SET NULL
			)
		`);

		this.m_db.execute(`
			CREATE TABLE IF NOT EXISTS deploys (
				uid TEXT PRIMARY KEY,
				worker_id TEXT NOT NULL,
				time INTEGER NOT NULL,
				comment TEXT,
				env TEXT,
				script BLOB,

				FOREIGN KEY (worker_id) REFERENCES workers(uid) ON DELETE CASCADE
			)
		`);
	}

	shutdown() {
		this.m_db.close();
	}

	async createWorker(init: WorkerInit): Promise<string> {

		let workerId: string | null = null;

		for (let idx = 0; idx < 64; idx++) {
			
			const next = crypto.randomUUID();
			if (await this.workerExists(next)) {
				continue;
			}

			workerId = next;
			break;
		}

		if (!workerId) {
			throw new Error('Failed to generate unique worker id');
		}

		this.m_db.query(`INSERT INTO workers (uid,name) VALUES (?,?)`, [workerId, init.name.trim()]);

		return workerId;
	}

	async workerExists(deployId: string): Promise<boolean> {
		const rows = this.m_db.query<[number]>(`SELECT EXISTS (SELECT 1 FROM workers WHERE uid = (?))`, [deployId]);
		const [ idExists ] = rows[0];
		return !!idExists;
	}

	async getWorker(workerId: string): Promise<WorkerRecord | null> {

		type Row = [string, string, string];

		const rows = this.m_db.query<Row>(`SELECT * FROM workers WHERE uid = (?) LIMIT 1`, [workerId]);
		if (!rows.length) {
			return null
		}

		const [uid, name, active_deploy] = rows[0];
		return { uid, name, active_deploy };
	}

	async listWorkers(): Promise<WorkerMetadata[]> {
		type Row = [string, string];
		const rows = this.m_db.query<Row>(`SELECT uid, name FROM workers`);
		return rows.map(([uid, name]) => ({ uid, name }));
	}

	async deleteWorker(workerId: string) {

		if (!await this.workerExists(workerId)) {
			throw new Error(`Worker id ${workerId} doesn't exist`);
		}

		this.m_db.query(`DELETE FROM workers WHERE uid = (?)`, [workerId]);
	}

	async createDeploy(worker_id: string, init: DeployInit): Promise<string> {

		let deploy_id: string | null = null;

		for (let idx = 0; idx < 64; idx++) {
			
			const next = crypto.randomUUID();

			const rows = this.m_db.query<[number]>(
				`SELECT EXISTS (SELECT 1 FROM deploys WHERE worker_id = (?) AND uid = (?))`,
				[worker_id, next]);

			const [ idExists ] = rows[0];
			if (idExists) {
				continue;
			}

			deploy_id = next;
			break;
		}

		if (!deploy_id) {
			throw new Error('Failed to generate unique worker id');
		}

		const deployTime = Math.floor(new Date().getTime() / 1000);

		const rows = this.m_db.query<[string]>(`SELECT name FROM workers WHERE uid = (?) LIMIT 1`, [worker_id]);
		if (!rows.length) {
			throw new Error('Could not retrieve worker metadata');
		}

		const [worker_name] = rows[0];

		const workerModuleBundled = await transformWorker(init.script, { deploy_id, worker_name });

		this.m_db.query(
			`INSERT INTO deploys
			(uid, worker_id, time, comment, env, script)
			VALUES (?,?,?,?,?,?)`,
			[deploy_id, worker_id, deployTime, init.comment, envfield.pack(init.env), new Uint8Array(workerModuleBundled)]);

		return deploy_id;
	}

	async listDeploys(): Promise<DeployMetadata[]> {
		type Row = [string, string, number, string];
		const rows = this.m_db.query<Row>(`SELECT uid, worker_id, time, comment FROM deploys`);
		return rows.map(([uid, worker_id, time, comment]) => ({ uid, worker_id, time, comment }));
	}

	async deployExists(deployId: string): Promise<boolean> {
		const rows = this.m_db.query<[number]>(`SELECT EXISTS (SELECT 1 FROM deploys WHERE uid = (?))`, [deployId]);
		const [ idExists ] = rows[0];
		return !!idExists;
	}

	async getDeploy(deployId: string): Promise<DeployRecord | null> {

		type Row = [string, string, number, string, string, Uint8Array];
		const rows = this.m_db.query<Row>(`SELECT * FROM deploys WHERE uid = (?) LIMIT 1`, [deployId]);
		if (!rows.length) {
			return null
		}

		const [uid, worker_id, time, comment, env, script] = rows[0];

		return { uid, worker_id, time, comment, env: envfield.unpack(env), script };
	}

	async deleteDeploy(deployId: string) {

		if (!await this.deployExists(deployId)) {
			throw new Error(`Deploy id ${deployId} doesn't exist`);
		}

		this.m_db.query(`DELETE FROM deploys WHERE uid = (?)`, [deployId]);
	}

	async publishDeploy(deployId: string) {

		if (!await this.deployExists(deployId)) {
			throw new Error(`Deploy id ${deployId} doesn't exist`);
		}

		type Rows = [string, string | null, Uint8Array];
		const rows = this.m_db.query<Rows>(`SELECT worker_id, env, script FROM deploys WHERE uid = (?) LIMIT 1`, [deployId]);
		if (!rows.length) {
			throw new Error(`Could now find linked worker for ${deployId}`);
		}

		const [worker_id, env, script] = rows[0];

		const rowsw = this.m_db.query<[string]>(`SELECT name from workers WHERE uid = (?) LIMIT 1`, [worker_id]);
		if (!rowsw.length) {
			throw new Error(`No linked workers for deploy ${deployId}`);
		}

		const [ name ] = rowsw[0];
		if (!name) {
			throw new Error(`Failed to retrieve worker name for worker ${worker_id}`);
		}

		await this.m_hooks.deployService(name, { id: deployId, env: env ? JSON.parse(env) : {}, script });

		this.m_db.query(`UPDATE workers SET active_deploy = (?) WHERE uid = (?)`, [deployId, worker_id]);
	}

	async takedown(workerId: string) {

		const rows = this.m_db.query<[string]>(`SELECT name FROM workes WHERE uid = (?) LIMIT 1`, [workerId]);
		const [name] = rows[0];
		if (!name) {
			throw new Error(`Could not get worker name for worker ${workerId}`)
		}

		this.m_db.query(`UPDATE workers SET active_deploy = null WHERE uid = (?)`, [workerId]);
		this.m_hooks.removeService(name);
	}

	async listActiveDeploys(): Promise<ActiveDeployEntry[]> {

		const rows = this.m_db.query<[string, string]>(
			`SELECT name, active_deploy from workers WHERE active_deploy IS NOT NULL`);

		return rows.map(([worker_name, deploy_id]) => ({ worker_name, deploy_id }));
	}
};
