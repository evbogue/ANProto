import {
  CHUNK_SIZE,
  MemoryBlobStore,
  downloadBlob,
  getBlob,
  mediaArtifact,
  putBlob,
  verifyBlob,
} from "./blob.js";

function assert(value, message = "assertion failed") {
  if (!value) throw new Error(message);
}

function equalBytes(a, b) {
  return a.length === b.length && a.every((value, i) => value === b[i]);
}

Deno.test("small blob round trip", async () => {
  const store = new MemoryBlobStore();
  const input = new TextEncoder().encode("hello ANProto");
  const id = await putBlob(input, store);

  assert(id.startsWith("anblob:v1:raw:sha256:"));
  assert(await verifyBlob(id, input));
  assert(equalBytes(await getBlob(id, store), input));
});

Deno.test("same bytes have the same id and deduplicate", async () => {
  const store = new MemoryBlobStore();
  const input = new TextEncoder().encode("same bytes");

  const a = await putBlob(input, store);
  const recordsAfterFirstPut = store.size;
  const b = await putBlob(input, store);

  assert(a === b);
  assert(store.size === recordsAfterFirstPut);
});

Deno.test("tampered bytes fail verification", async () => {
  const store = new MemoryBlobStore();
  const id = await putBlob("hello", store);
  assert(!(await verifyBlob(id, "goodbye")));
});

Deno.test("large blobs are chunked and reconstructed", async () => {
  const store = new MemoryBlobStore();
  const input = new Uint8Array(CHUNK_SIZE * 2 + 123);

  for (let i = 0; i < input.length; i++) input[i] = i % 251;

  const id = await putBlob(input, store);

  assert(id.startsWith("anblob:v1:chunked:sha256:"));
  assert(store.size === 4, "manifest + three chunks expected");
  assert(await verifyBlob(id, input));
  assert(equalBytes(await getBlob(id, store), input));
});

Deno.test("tampered chunks are rejected on retrieval", async () => {
  const store = new MemoryBlobStore();
  const input = new Uint8Array(CHUNK_SIZE + 5).fill(7);
  const id = await putBlob(input, store);

  const manifest = JSON.parse(new TextDecoder().decode(await store.get(id)));
  await store.put(manifest.chunks[0].id, new Uint8Array([1, 2, 3]));

  let rejected = false;
  try {
    await getBlob(id, store);
  } catch {
    rejected = true;
  }

  assert(rejected);
});

Deno.test("media artifacts point to blobs instead of embedding media", async () => {
  const store = new MemoryBlobStore();
  const id = await putBlob(new Uint8Array([1, 2, 3]), store);
  const artifact = mediaArtifact({
    blob: id,
    mime: "audio/webm",
    name: "voice-note.webm",
    duration: 4.2,
  });

  assert(artifact.type === "audio");
  assert(artifact.blob === id);
  assert(artifact.duration === 4.2);
});


Deno.test("multi-source downloader assembles chunks from different stores", async () => {
  const origin = new MemoryBlobStore();
  const input = new Uint8Array(CHUNK_SIZE * 2 + 333);
  for (let i = 0; i < input.length; i++) input[i] = (i * 7) % 251;

  const id = await putBlob(input, origin);
  const manifestBytes = await origin.get(id);
  const manifest = JSON.parse(new TextDecoder().decode(manifestBytes));

  const a = new MemoryBlobStore();
  const b = new MemoryBlobStore();
  const c = new MemoryBlobStore();

  // Only one source has the manifest.
  await a.put(id, manifestBytes);

  // Spread the pieces across three different sources.
  for (let i = 0; i < manifest.chunks.length; i++) {
    const chunk = manifest.chunks[i];
    const bytes = await origin.get(chunk.id);
    [a, b, c][i % 3].put(chunk.id, bytes);
  }

  const progress = [];
  const output = await downloadBlob(id, [a, b, c], {
    concurrency: 3,
    random: () => 0.42,
    onChunk: (event) => progress.push(event.index),
  });

  assert(equalBytes(output, input));
  assert(progress.length === manifest.chunks.length);
});

Deno.test("multi-source downloader falls back from corrupt copies", async () => {
  const origin = new MemoryBlobStore();
  const input = new Uint8Array(CHUNK_SIZE + 77).fill(23);
  const id = await putBlob(input, origin);
  const manifestBytes = await origin.get(id);
  const manifest = JSON.parse(new TextDecoder().decode(manifestBytes));

  const corrupt = new MemoryBlobStore();
  const valid = new MemoryBlobStore();

  await corrupt.put(id, manifestBytes);
  await valid.put(id, manifestBytes);

  for (const chunk of manifest.chunks) {
    await corrupt.put(chunk.id, new Uint8Array(chunk.size).fill(99));
    await valid.put(chunk.id, await origin.get(chunk.id));
  }

  const output = await downloadBlob(id, [corrupt, valid], {
    random: () => 0.999,
  });

  assert(equalBytes(output, input));
});

Deno.test("multi-source downloader caches pieces locally", async () => {
  const origin = new MemoryBlobStore();
  const cache = new MemoryBlobStore();
  const input = new Uint8Array(CHUNK_SIZE + 11).fill(5);
  const id = await putBlob(input, origin);

  const output = await downloadBlob(id, [origin], { store: cache });

  assert(equalBytes(output, input));
  assert(await cache.has(id));

  const manifest = JSON.parse(new TextDecoder().decode(await cache.get(id)));
  for (const chunk of manifest.chunks) {
    assert(await cache.has(chunk.id));
  }
});
