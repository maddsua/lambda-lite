# An deno based serverless function thingy


## What and why

You can treat it like it's Netlify Functions but it runs everywhere. I was working with Functions a lot and I really like it but they can't be run separately in docker containers and with other services.


## Usage

Create some handler functions, load them and that's it!

I hate writing docs so just check the [examples](examples/). It's a dead simple tool and you don't need to be a rocket scientist to figure how to use it.

## Routing

### 404 pages

Create a route with a path `/_404` to provide custom 404 response.

### Expanded paths

A path that ends with a star (`/path/*`) or has `expand` config propery set to true will catch all requests that would be covered by a glob.

Yeah, I can't use words, whatever, it just means that a path like `/api/*` would "catch" requests to `/api/beer` IF the last one is not defined.

## Yeah real good docs thanx 😎👍

If you don't get what it's all about check out Netlify Functions docs - it's literally the same idea

https://docs.netlify.com/functions/overview/

https://www.netlify.com/platform/core/functions/

I know, the docs suck, but I have no incentive to write it better - nobody but me uses that 🤷‍♂️

If you wanna contribute or whatever - you're welcome to do so.
