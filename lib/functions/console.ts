
export class ServiceConsole {

	requestID: string;
	constructor(requestID: string) {
		this.requestID = requestID;
	}

	log(...data: any[]) {
		console.log(`[${this.requestID}]`, ...arguments);
	}

	success(...data: any[]) {
		console.log(`[${this.requestID}] ✅`, ...arguments);
	}

	warn(...data: any[]) {
		console.warn(`[${this.requestID}] 🚨`, ...arguments);
	}

	error(...data: any[]) {
		console.error(`[${this.requestID}] ❌`, ...arguments);
	}
};
