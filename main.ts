import { existsSync } from "https://deno.land/std@0.220.1/fs/exists.ts";

interface DeploymentManifest {
	id: string;
	time: number;
	env: Record<string, string>;
};

class DeploymentEntry {

	manifest: DeploymentManifest;
	location: string;

	constructor(id: string, service: string, dataLoc: string) {

		this.location = `${dataLoc}/${service}/${id}`;
		const manifestLoc = `${this.location}/manifest.json`;

		if (!existsSync(manifestLoc)) {
			throw new Error(`Deploy manifest for "${service}/${id}" does not exist`);
		}

		try {
			this.manifest = JSON.parse(Deno.readTextFileSync(manifestLoc));
		} catch (error) {
			throw new Error(`Unable to parse deploy manifest for "${service}/${id}"`);
		}
	}
};

interface DeploymentInfo {
	id: string;
	time: number;
};

interface ServiceManifest {
	deployments: DeploymentInfo[];
};

interface ServiceEntryData extends ServiceManifest {
	id: string;
};

class ServiceEntry {

	id: string;
	manifestPath: string;
	data: ServiceEntryData = {} as any;

	#load() {
		this.data = JSON.parse(Deno.readTextFileSync(this.manifestPath));
	}

	#save() {
		Deno.writeTextFileSync(this.manifestPath, JSON.stringify(this.data, null, 2));
	}

	constructor(id: string, svcdir: string, init?: ServiceEntryData) {

		this.id = id;
		this.manifestPath = `${svcdir}/${this.id}/manifest.json`;

		if (!init) {
			this.#load();
		} else {
			this.data = init;
		}
	}

	getAllDeployments(): readonly DeploymentInfo[] {
		return this.data.deployments;
	}

	getDeployment(id: string): DeploymentInfo | null {
		const deployment = this.data.deployments.find(item => item.id === id);
		return deployment || null;
	}

	deploymentExists(id: string): boolean {
		return this.data.deployments.some(item => item.id === id);
	}

	removeDeployment(id: string) {

		const deployment = this.data.deployments.find(item => item.id === id);
		if (!deployment) {
			throw new Error(`Deployment "${id}" does not exist`);
		}

		this.data.deployments = this.data.deployments.filter(item => item.id !== id);
		this.#save();
	}

	addDeployment(deploy: DeploymentInfo) {

		const exists = this.data.deployments.some(item => item.id === deploy.id);
		if (exists) {
			throw new Error(`Deployment "${deploy.id}" already exists`);
		}

		this.data.deployments.push(deploy);

		this.#save();
	}
};

export class ServiceManager {

	dataDir: string;
	servicesDir: string;
	serivces: ServiceEntry[] = [];
	
	constructor(datadir?: string) {

		this.dataDir = datadir || './data';
		this.servicesDir = `${this.dataDir}/services`;

		if (!existsSync(this.dataDir)) {
			Deno.mkdirSync(this.dataDir, { recursive: true });
		}

		this.updateServiceList();
	}

	async updateServiceList() {

		if (!existsSync(this.servicesDir)) {
			Deno.mkdirSync(this.servicesDir, { recursive: true });
		}

		const newList: ServiceEntry[] = [];

		for await (const entry of Deno.readDirSync(this.servicesDir)) {

			if (!entry.isDirectory) {
				continue;
			}

			const serviceManifest = `${this.servicesDir}/${entry.name}/manifest.json`;
			if (!existsSync(serviceManifest)) {
				console.warn('wtf broken service???');
				continue;
			}

			newList.push(new ServiceEntry(entry.name, this.servicesDir));
		}

		console.log(newList);
		this.serivces = newList;
	}
};

const shit = new ServiceManager();

await new Promise(resolve => setTimeout(resolve, 10));

shit.serivces[0].addDeployment({
	time: 0,
	id: 'tset-deploy'
});
