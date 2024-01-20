import { typedFetch } from "../../lib.mod.ts";
import type { RouterType } from "./server.ts";

const response = await typedFetch<RouterType['post_order']>('http://localhost:8080/post_order', {
	data: {
		person: 'maddsua',
		product_ids: ['gf-rtx-2060'],
		total: 250
	}
});

console.log('[Test result] Post status:', response.status);
