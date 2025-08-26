# ANProto

ed25519 keypairs sign timestamp + hash in base64

### code

use Deno or your browser

```
import { an } from './an.js'

console.log(await an.gen())

// BSY7/er4VJIu08o39NaRAiPY/MAvd7oQhlGCRDABjYU=tQa03kqUWG3VtHZ98++lHFBeQ4JKZwuTH2CjC/K6P8EFJjv96vhUki7Tyjf01pECI9j8wC93uhCGUYJEMAGNhQ==

console.log(await an.hash('Hello World'))
// pZGm1Av0IEBKARczz7exkNYsZb8LzaMrV7J32a2fFG4=

console.log(await an.sign('Hello World', await a.gen()))
// BSY7/er4VJIu08o39NaRAiPY/MAvd7oQhlGCRDABjYU=yVpD8i7d3d4dls3YThEg1x1vSdmqeEweV4e4Ejl/8yPoVG7JR0YAKDPagQOgxXMrlCVLNNqvlNvj4xRDOYDLBjE3NTUxOTc4NDEzMTlwWkdtMUF2MElFQktBUmN6ejdleGtOWXNaYjhMemFNclY3SjMyYTJmRkc0PQ==

console.log(await an.open('BSY7/er4VJIu08o39NaRAiPY/MAvd7oQhlGCRDABjYU=yVpD8i7d3d4dls3YThEg1x1vSdmqeEweV4e4Ejl/8yPoVG7JR0YAKDPagQOgxXMrlCVLNNqvlNvj4xRDOYDLBjE3NTUxOTc4NDEzMTlwWkdtMUF2MElFQktBUmN6ejdleGtOWXNaYjhMemFNclY3SjMyYTJmRkc0PQ=='))

//1755197841319pZGm1Av0IEBKARczz7exkNYsZb8LzaMrV7J32a2fFG4=
```

---

MIT
