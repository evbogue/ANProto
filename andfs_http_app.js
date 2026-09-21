import { Hono } from "jsr:@hono/hono";
import { hash, validHash } from "./vendor/andfs.js";

const app = new Hono();
const blocks = new Map();

app.put("/:id", async (c) => {
  const id = c.req.param("id");
  if (!validHash(id)) return c.text("invalid AndFS block hash", 400);
  const bytes = new Uint8Array(await c.req.arrayBuffer());
  if (await hash(bytes) !== id) return c.text("block hash does not match body", 400);
  blocks.set(id, bytes);
  return c.body(null, 204);
});

app.get("/:id", (c) => {
  const id = c.req.param("id");
  if (!validHash(id)) return c.text("invalid AndFS block hash", 400);
  const bytes = blocks.get(id);
  if (!bytes) return c.body(null, 404);
  c.header("Content-Type", "application/octet-stream");
  c.header("Cache-Control", "public, immutable, max-age=31536000");
  c.header("Access-Control-Allow-Origin", "*");
  return c.body(bytes);
});

app.on("HEAD", "/:id", (c) => {
  const id = c.req.param("id");
  if (!validHash(id)) return c.body(null, 400);
  return c.body(null, blocks.has(id) ? 204 : 404);
});

export default app;
