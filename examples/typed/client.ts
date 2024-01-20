
import { TypedFetchAgent } from "../../lib.mod.ts";
import type { RouterType } from "./server.ts";

const agent = new TypedFetchAgent<RouterType>({
	endpoint: 'http://localhost:8080/'
});

const statusResult = await agent.query.status();

console.log('[Test result] Uptime:', statusResult.data.uptime_s);

const postOrderResult = await agent.query.post_order({
	data: {
		person: 'maddsua',
		product_ids: ['gf-rtx-2060'],
		total: 250
	}
});

console.log('[Test result] Post status:', postOrderResult.status);
