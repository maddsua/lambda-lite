
import { TypedFetchAgent } from "../../lib.mod.ts";
import type { RouterType } from "./server.ts";

const agent = new TypedFetchAgent<RouterType>({
	endpoint: 'http://localhost:8080/'
});

const { data } = await agent.query.action();

console.log(data.message);

const response2 = await agent.query.mutation({
	data: {
		id: 'test'
	}
});

console.log(response2.status);
