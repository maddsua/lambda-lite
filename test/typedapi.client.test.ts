
import { TypedFetchAgent } from "../lib/client/fetchAgent.ts";
import { RouterType } from "./typedapi.server.test.ts";

const agent = new TypedFetchAgent<RouterType>({
	endpoint: '/api'
});

agent.query.action();

agent.query.mutation({
	data: {
		id: 'tt'
	}
});
