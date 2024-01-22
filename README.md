# An ~~deno based~~ API server framework that tries to reinvent the wheel but better.

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

I hate writing docs so just check the [examples](examples/). It's a dead simple tool and you don't need to be a rocket scientist to figure how to use it.

## Routing

### 404 pages

Create a route with a path `/_404` to provide custom 404 response.

### Expanded paths

A path that ends with a star (`/path/*`) or has `expand` config propery set to true will catch all requests that would be covered by a glob.

Yeah, I can't use words, whatever, it just means that a path like `/api/*` would "catch" requests to `/api/beer` IF the last one is not defined.

## Typed endpoints

A cool new feature are typed endpoints, which allow both client and server share a contract on what data is sent or received. It's implemented purely in TypeScript and doesn't do any runtime type checks like is done by TRPC. I do think it's not necessary. If you really need them you can always duct tape zod no top of your endpoint, but it’s not included by default.

Usage example can be found [here](examples/typed/)

## Deploying

The fastest way to deploy LambdaLite is Railwal.app, altho you can run it virtually anywhere (including Cloudflare Workers 🤠).

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template/YslOZk?referralCode=Mi0Jqj)

---


## More

If you don't get what it's all about check out Netlify Functions docs - it's literally the same idea

https://docs.netlify.com/functions/overview/

https://www.netlify.com/platform/core/functions/
