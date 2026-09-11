# ANProto blobs

ANProto artifacts authenticate **meaning**. Blob IDs authenticate **bytes**.

```text
ANProto artifact
      |
      +-- blob: anblob:v1:...
                |
                +-- image / audio / video / file
```

## API

```js
import {
  MemoryBlobStore,
  getBlob,
  putBlob,
  verifyBlob,
} from "./blob.js";

const store = new MemoryBlobStore();

const id = await putBlob(file, store);
const bytes = await getBlob(id, store);
console.log(await verifyBlob(id, bytes)); // true
```

A store only needs asynchronous `put(id, bytes)` and `get(id)` methods. `has(id)` is optional and enables deduplication without rewriting existing data.

## Small blobs

Values up to 1 MiB are addressed directly:

```text
anblob:v1:raw:sha256:<base64url>
```

## Large blobs

Values larger than 1 MiB are split into deterministic 1 MiB chunks. ANProto stores a canonical manifest containing the ordered chunk IDs and sizes.

```text
anblob:v1:chunked:sha256:<manifest-hash>
      |
      +-- chunk 1
      +-- chunk 2
      +-- chunk 3
```

Each chunk is independently verified while it is retrieved. `verifyBlob()` can also recompute the entire blob ID from the original bytes without trusting the store.

## Media artifacts

The blob has no opinion about media type. The ANProto artifact carries that meaning:

```js
const artifact = {
  type: "video",
  blob: "anblob:v1:chunked:sha256:...",
  mime: "video/webm",
  title: "Chicago river demo"
};
```

`mediaArtifact()` is a small helper for this shape.

## Phone upload and recording demo

Run the ANProto web app and open:

```text
/media
```

The demo supports:

- audio/video files selected from a phone
- microphone recording
- camera + microphone video recording
- content-addressing
- integrity verification
- reconstructed audio/video playback
- an example ANProto artifact pointing at the blob

Camera/microphone access requires HTTPS or localhost.



## Multi-source downloads

Large blobs can be assembled BitTorrent-style from different places.

```js
import { downloadBlob } from "./blob.js";

const bytes = await downloadBlob(blobId, [
  localStore,
  "https://peer-one.example/blobs",
  "https://peer-two.example/blobs",
], {
  concurrency: 6,
  store: localCache,
  onChunk: ({ index, total }) => {
    console.log(`piece ${index + 1}/${total}`);
  },
});
```

For every chunk, the downloader:

1. shuffles the source order,
2. tries sources until one returns valid bytes,
3. verifies the chunk hash,
4. falls back if a source is missing or corrupt,
5. downloads several chunks in parallel,
6. optionally caches verified pieces locally,
7. verifies the final reconstructed blob.

Sources can be blob stores, async functions, or HTTP base URLs.

This means one video can be reconstructed from pieces held by several different peers without trusting any of them.

## Storage and transport

The v1 module deliberately does **not** choose a network.

A blob store can be backed by:

- local disk
- IndexedDB
- HTTP
- SSB
- IPFS
- Yggdrasil
- another peer

The invariant is only: bytes returned for an ID must verify against that ID.


## How this compares

ANProto blobs borrow the best idea from both SSB blobs and IPFS: **content addressing**. The main difference is that ANProto keeps the blob layer deliberately smaller and transport-agnostic.

| | ANProto blobs | SSB blobs | IPFS |
|---|---|---|---|
| Content addressed | Yes | Yes | Yes |
| Large-file chunking | Yes, fixed 1 MiB | Not in the blob ID itself | Yes |
| Per-chunk verification | Yes | No | Yes |
| Built-in network | No | SSB gossip/wants | IPFS networking |
| Requires a daemon/node | No | Usually an SSB stack | Usually an IPFS implementation |
| File/directory DAGs | No | No | Yes |
| Multiple codecs/hash schemes | No, v1 is intentionally fixed | No | Yes |
| Same bytes → deterministic ID | Yes | Yes for a blob | Only when CID parameters match |
| Designed to plug into other transports | Yes | Mostly SSB | Mostly IPFS ecosystem |

### Compared with SSB blobs

SSB's blob store is simple and proven: blobs are identified by hash, and peers gossip what they want. The `ssb-blobs` protocol also has useful replication ideas such as wants, sympathetic wants, and push. What ANProto changes is the boundary: **blob identity is independent from replication**.

That means an ANProto blob can be stored or moved over HTTP, IndexedDB, SSB, IPFS, Yggdrasil, local disk, or something we have not invented yet.

ANProto also chunks large files into independently verified pieces. That makes large audio/video files easier to resume, stream, deduplicate, and verify incrementally than treating the whole file as one monolithic SSB blob.

Where SSB is stronger today: it already has a working peer-to-peer blob replication protocol. ANProto v1 does not try to replace that; an SSB blob store could simply be one backend.

### Compared with IPFS

IPFS is much more powerful. It provides CIDs, multiple codecs, Merkle DAGs, UnixFS files/directories, rich networking, and a mature ecosystem.

ANProto blobs intentionally do less.

For v1, the format fixes:

- SHA-256
- base64url IDs
- 1 MiB chunks
- one deterministic manifest shape

That gives ANProto a useful property: **two implementations can produce the same blob ID from the same bytes without negotiating a CID profile, DAG layout, codec, or chunking strategy.**

IPFS can represent far more complex data structures and optimize different workloads. ANProto prefers one boring representation that is easy to implement in a browser, Deno, a phone app, or a tiny client.

### Why use ANProto blobs?

Not because they are universally better than IPFS or SSB.

They are better for ANProto's specific goal when we want:

1. a tiny content-addressed primitive,
2. deterministic IDs across implementations,
3. verified chunked media,
4. no required network stack, and
5. the freedom to use SSB, IPFS, HTTP, or anything else underneath.

The design rule is:

> **ANProto defines what bytes are. The application decides where they live and how they move.**
