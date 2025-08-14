# AProto

ed25519 keypairs sign ts + hash in base64

### code

use Deno or your browser

```
import { a } from './a.js'

console.log(await a.gen())
// NtrdkXob+epH2c/k3GVtdw8lnJzMt+eEWQQ5VYgaARc=XgGOj8lESOXzfmoN6tA5fca+c5fXukw1LJFJYVhf38U22t2Rehv56kfZz+TcZW13DyWcnMy354RZBDlViBoBFw==

console.log(await a.hash('Hello World'))
// pZGm1Av0IEBKARczz7exkNYsZb8LzaMrV7J32a2fFG4=

console.log(await a.sig('Hello World', await a.gen()))
// 6qEZt6kv82bBpDcN0KFMUd7Bhj9HM8pDmK/+AvoPuOGH/DxdBJyOf/wsIx/IyLJRDpSL4jbIKa7mNyUEfrSWDTE3NTUxOTI3NzkwMzhwWkdtMUF2MElFQktBUmN6ejdleGtOWXNaYjhMemFNclY3SjMyYTJmRkc0PQ==
```
---
MIT
