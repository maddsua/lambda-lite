# lambda-lite

A deno based API server framework

You can treat it like it's Netlify functions but it runs everywhere. I was working with Functions a lot and I really like it but they can't be run separately in docker containers and with other services.

Yeah, other platforms have their own implementations of that concept too, but Cloduflare Pages Functions / Workers are still undercooked, things are not better with smaller platforms and Vercel's stuff just sucks.

## Usage

### Standalone mode

#### Configuration

Set these environment vartiables to configure server behavior:

`LLAPP_PORT` : Port on which server should start (passed directly to Deno.serve)

`LLAPP_HOSTNAME` : Server host (passed directly to Deno.serve)

`LLAPP_ROUTES_DIR` : Directory containing all route functions

`LLAPP_HANDLE_CORS` : Whether to handle CORS automatically based on set allowed origins (true/false)

`LLAPP_ALLOWED_ORIGINS` : Allowed origins (comma-separated)

`LLAPP_RATELIMIT_PERIOD` : Set window period for rate limiter

`LLAPP_RATELIMIT_REQUESTS` : Set allowed number or requests withing rate limiter window

`LLAPP_SERVICE_TOKEN` : Set service access token

\* LLAPP stands for "lambda-lite app". Pun intended.

#### Run

Start command:

```
deno run --allow-all https://raw.githubusercontent.com/maddsua/lambda-lite/[tag]/bootstrap.ts
```

\* don't forget to replace `[tag]` with actual version tag

### Configurable mode

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

Now launch it with `deno run --allow-all main.ts`

\* again, don't forget to replace `[tag]` with actual version tag

---

## More

If you don't get what it's all about check out Netlify Functions docs - it's literally the same idea

https://docs.netlify.com/functions/overview/

https://www.netlify.com/platform/core/functions/
