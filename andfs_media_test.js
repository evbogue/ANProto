import { assertEquals } from "jsr:@std/assert";
import { createAndFS, SIZE } from "./vendor/andfs.js";
import { memoryStore } from "./andfs_store.js";

Deno.test("media format uses the pinned AndFS v1 manifest", async () => {
  const bytes = new Uint8Array(SIZE + 1).fill(42);
  const files = createAndFS({ store: memoryStore() });
  const added = await files.add(bytes);
  const manifest = await files.manifest(added.manifestHash);

  assertEquals(manifest.andfs, 1);
  assertEquals(manifest.chunkSize, 262144);
  assertEquals(manifest.chunks.length, 2);
  assertEquals(await files.get(added.manifestHash), bytes);
});
