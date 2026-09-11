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
