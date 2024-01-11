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

Create a main file using the example:

```typescript
import { startServer } from 'https://raw.githubusercontent.com/maddsua/lambda-lite/[tag]/mod.ts';

startServer({
  serve: {
    port: 8080
  },
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
