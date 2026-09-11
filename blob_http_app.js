import { Hono } from "jsr:@hono/hono";
import { MemoryBlobStore } from "./blob.js";

const app = new Hono();
const store = new MemoryBlobStore();

app.put("/:id", async (c) => {
  const id = c.req.param("id");
  const bytes = new Uint8Array(await c.req.arrayBuffer());
  await store.put(id, bytes);
  return c.body(null, 204);
});

app.get("/:id", async (c) => {
  const id = c.req.param("id");
  const bytes = await store.get(id);
  if (!bytes) return c.body(null, 404);
  c.header("Content-Type", "application/octet-stream");
  c.header("Cache-Control", "public, immutable, max-age=31536000");
  return c.body(bytes);
});

app.on("HEAD", "/:id", async (c) => {
  const id = c.req.param("id");
  return c.body(null, (await store.has(id)) ? 204 : 404);
});

export default app;
