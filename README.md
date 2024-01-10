# A ~~deno based~~ API server framework that tries to reinvent the wheel but better.

### 🚨 Warning: TypeScript only

This is a Deno-first package and yes, there's no tsconfig in here. Use deno-ts to get all the IDE features.

It's npm package only provides TypeScript version of the library (there are no other versions lmao) so if you gonna use it with anything that is not Deno bundle it with esbuild first. And for Deno, just use http imports ffs.

Oh and don't use tsc with it. You've been warned.

### Supported platforms: 

- Deno

- Cloudflare workers

- Node 18 and newer

	(needs to be hooked up to the `node:http` manually. Personally I don't use node with it that's why no adapter provided, but it's dead simple to make one)

## What and why

You can treat it like it's Netlify functions but it runs everywhere. I was working with Functions a lot and I really like it but they can't be run separately in docker containers and with other services.

Yeah, other platforms have their own implementations of that concept too, but Cloduflare Pages Functions / Workers are still undercooked, things are not better with smaller platforms and Vercel's stuff just sucks.

## Usage

### Standalone mode

In standalone mode you'd need to have a directory with handler modules, one would look like this:

```typescript
//	functions/route.ts
export const handler = () => new Response("yo");
```

Configure these environment vartiables to adjust server behavior:

`LLAPP_PORT` : Port on which server should start (passed directly to Deno.serve)

`LLAPP_HOSTNAME` : Server host (passed directly to Deno.serve)

`LLAPP_ROUTES_DIR` : Directory containing all route functions

`LLAPP_HANDLE_CORS` : Whether to handle CORS automatically based on set allowed origins (true/false)

`LLAPP_ALLOWED_ORIGINS` : Allowed origins (comma-separated)

`LLAPP_RATELIMIT_PERIOD` : Set window period for rate limiter

`LLAPP_RATELIMIT_REQUESTS` : Set allowed number or requests withing rate limiter window

`LLAPP_SERVICE_TOKEN` : Set service access token

\* LLAPP stands for "lambda-lite app". Pun intended.

And then just run deno with the command:

```bash
deno run --allow-all https://raw.githubusercontent.com/maddsua/lambda-lite/[tag]/bootstrap.ts
```

\* don't forget to replace `[tag]` with an actual version tag

### Modular mode

Create a main file using this example:

```typescript
import { startServer } from 'https://raw.githubusercontent.com/maddsua/lambda-lite/[tag]/mod.ts';

startServer({
  serve: {
    port: 8080
  },
  proxy: {
    requestIdHeader: 'x-request-id',
    forwardedIPHeader: 'x-envoy-external-address'
  },
  allowedOrigings: [
    "example.com"
  ]
  handlers: {
    '/post_order': {
      handler: (requect, context) => {
        // do whatever
        return new Resonse(null, { status: 201 })
      }
    },
    '/health': {
      handler: () => new Response(null, { status: 200 }),
      config: {
        allowedOrigings: null
      }
    }
  }
});

```

Now launch it with `deno run -A main.ts`

\* again, don't forget to replace `[tag]` with an actual version tag

---

## More

If you don't get what it's all about check out Netlify Functions docs - it's literally the same idea

https://docs.netlify.com/functions/overview/

https://www.netlify.com/platform/core/functions/
