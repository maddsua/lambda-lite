import { FetchSchema, TypedHandler, TypedResponse, TypedRouteContext } from "../../../lib.mod.ts";

type Schema = FetchSchema<{
	response: {
		data: {
			success: boolean;
			uptime_s: number;
		}
	}
}>;

const startTime = new Date().getTime();

export const handler: TypedHandler<Schema> = () => new TypedResponse({
	success: true,
	uptime_s: Math.floor((new Date().getTime() - startTime) / 1000)
});

export default {
	handler
} satisfies TypedRouteContext
