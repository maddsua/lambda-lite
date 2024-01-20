# A ~~deno based~~ API server framework that tries to reinvent the wheel but better.

## What and why

You can treat it like it's Netlify Functions but it runs everywhere. I was working with Functions a lot and I really like it but they can't be run separately in docker containers and with other services.

### 🚨 Warning: TypeScript only

This is a Deno-first package and yes, there's no tsconfig in here. Use deno-ts to get all the IDE features.

It's npm package only provides TypeScript version of the library (there are no other versions lmao) so if you gonna use it with anything that is not Deno bundle it with esbuild first. And for Deno, just use http imports ffs.

Oh and don't use tsc with it. You've been warned.

## Supported platforms: 

- Deno ✅

- Cloudflare Workers ✅

- NodeJS 😱

	Look, I honestly don't care about node. If you do, nobody stops you from wasting a few hours of your time making typescript work in both environments. But if you just wanna make it work, you can reuse code from Cloudflare adapter and hook it up to `node:http` instead of exporting that stuff.

## Building

### Deno

You can just import modules directly using http imports. It will work out of the box.

### Anything else

1. Install npm package OR cache http imports. It's all up to you.

2. Bundle into runable javascript using esbuild or any other bundler that won't choke on imports that have .ts extensions.

## Usage

Create a main file using the example:

```typescript
import { startDenoServer } from "https://raw.githubusercontent.com/maddsua/lambda-lite/[tag]/adapters.mod.ts";
import { serviceAuth } from "https://raw.githubusercontent.com/maddsua/lambda-lite/[tag]/plugins.mod.ts";

startDenoServer({
  serve: {
    port: 8080
  },
  routes: {
    '/': {
      handler: () => new Resonse('Hi! This is a super secret API server xD'),
	  inheritPlugins: false
    },
    '/post_order': {
      handler: (requect, context) => {
        // do whatever
        return new Resonse(null, { status: 201 })
      }
    },
  },
  plugins: [
    serviceAuth({ token: 'test_token'}),
  ]
});

```

Now launch it with `deno run -A main.ts`

\* again, don't forget to replace `[tag]` with an actual version tag

## Deploying

The fastest way to deploy LambdaLite is Railwal.app, altho you can run it virtually anywhere.

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template/YslOZk?referralCode=Mi0Jqj)

---

## More

If you don't get what it's all about check out Netlify Functions docs - it's literally the same idea

https://docs.netlify.com/functions/overview/

https://www.netlify.com/platform/core/functions/
