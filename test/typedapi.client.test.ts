
import { TypedFetchAgent } from "../lib/client/fetchAgent.ts";
import { RouterType } from "./typedapi.server.test.ts";

const agent = new TypedFetchAgent<RouterType>({
	endpoint: 'http://localhost:8080/'
});

const { data } = await agent.query.action();

console.log(data?.message);

/*agent.query.mutation({
	data: {
		id: 'tt'
	}
});*/
