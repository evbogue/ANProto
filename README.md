<img src='https://raw.githubusercontent.com/evbogue/wiredove/master/doveorange_sm.png' style='width: 75px; height: 75px;' />

# ANProto

the **A**uthenticated and **N**on-networked protocol or **AN**other protocol

ed25519 keypairs sign timestamp + hash in base64

***

[anproto.com](https://anproto.com)

+ [JavaScript implementation](https://github.com/evbogue/anproto) [by Evbogue]
+ [Golang implementation](https://github.com/vic/goan) [by Vic]
+ [Rust implementation](https://github.com/vic/anproto-rs/) [by Vic]
+ [Python implementation](https://github.com/macauleyjustin/ANproto-Python) [by Justin]
  
try it at [anproto.com/try](https://anproto.com/try), test [AndFS v1 audio/video media](https://anproto.com/media), or use a client such as [wiredove](https://wiredove.net/)

***

### What is ANProto?

+ ANProto is the spiritual successor to [secure-scuttlebot](https://scuttlebot.io), but without all of the extra stuff that is difficult to maintain. 
+ ANProto is an attempt to argue that [ATProto](https://atproto.com) is too involved in it's own networking infrastructure to be usefully decentralized. 
+ ANProto operates under the working theory that [Nostr](https://fiatjaf.com/nostr.html) will never reach anyone besides Bitcoiners. 

***

### Bring your own network!

ANProto works over any networking stack. Open the messages from your URL bar! Email them to your friends! Load them on a USB stick an slingshot them over a river! ANProto is non-networked, so you can send and retrieve the messages anyway you want. Try the fetch API or Websockets if you want a good place to start. But maybe dork out trying to send ANProto messages via Bluetooth, LoRa, or sync them via local wifi like you did with Scuttlebot!

***

### the JavaScript library!

use Deno or your browser

```
import { an } from './an.js'

console.log(await an.gen())
// BSY7/er4VJIu08o39NaRAiPY/MAvd7oQhlGCRDABjYU=tQa03kqUWG3VtHZ98++lHFBeQ4JKZwuTH2CjC/K6P8EFJjv96vhUki7Tyjf01pECI9j8wC93uhCGUYJEMAGNhQ==

console.log(await an.hash('Hello World'))
// pZGm1Av0IEBKARczz7exkNYsZb8LzaMrV7J32a2fFG4=

console.log(await an.sign(hash, await a.gen()))
// BSY7/er4VJIu08o39NaRAiPY/MAvd7oQhlGCRDABjYU=yVpD8i7d3d4dls3YThEg1x1vSdmqeEweV4e4Ejl/8yPoVG7JR0YAKDPagQOgxXMrlCVLNNqvlNvj4xRDOYDLBjE3NTUxOTc4NDEzMTlwWkdtMUF2MElFQktBUmN6ejdleGtOWXNaYjhMemFNclY3SjMyYTJmRkc0PQ==

console.log(await an.open('BSY7/er4VJIu08o39NaRAiPY/MAvd7oQhlGCRDABjYU=yVpD8i7d3d4dls3YThEg1x1vSdmqeEweV4e4Ejl/8yPoVG7JR0YAKDPagQOgxXMrlCVLNNqvlNvj4xRDOYDLBjE3NTUxOTc4NDEzMTlwWkdtMUF2MElFQktBUmN6ejdleGtOWXNaYjhMemFNclY3SjMyYTJmRkc0PQ=='))

//1755197841319pZGm1Av0IEBKARczz7exkNYsZb8LzaMrV7J32a2fFG4=
```

---

### Legacy content-addressed blobs

The browser media demo uses AndFS v1. The `anblob:v1` helpers below are retained as an earlier ANProto storage experiment, not the current media format.

ANProto artifacts can point at verified files without embedding the file itself.

```js
const store = new an.blob.MemoryBlobStore()
const id = await an.blob.putBlob(file, store)
const bytes = await an.blob.getBlob(id, store)
console.log(await an.blob.verifyBlob(id, bytes)) // true
```

Small blobs are SHA-256 addressed directly. Files larger than 1 MiB are split into deterministic 1 MiB chunks with a verified manifest.

See [BLOBS.md](./BLOBS.md) for the format, tests, storage interface, and phone audio/video demo.

---

MIT
