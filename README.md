# lambda-lite

A deno based API server framework

You can threat it like it's Netlify functions but it runs everywhere. A proper readme comes soon.

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

`LLAPP_EXPOSE_REQUEST_ID` : Whether to expose request id in response headers

\* LLAPP stands for "lambda-lite app". Pun intended.

#### Run

Start command:

```
deno run --allow-all https://raw.githubusercontent.com/maddsua/functions/[tag]/bootstrap.ts
```

\* don't forget to replace `[tag]` with actual version tag

## Example setup diagram

<img src="docs/jamstack-diagram.png" alt="JAMstack diagram" />
