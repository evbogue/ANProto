import { Hono } from "jsr:@hono/hono";
import { serveStatic } from "jsr:@hono/hono/deno";
import { marked } from "https://esm.sh/gh/evbogue/bog5@de70376265/lib/marked.esm.js";

import { foot, head } from "./template.js";
import tryApp from "./try_app.js";
import mediaApp from "./media_app.js";
import blobHttpApp from "./blob_http_app.js";
import andfsHttpApp from "./andfs_http_app.js";
import { portfolio } from "./portfolio.js";

const app = new Hono();

const readme = await Deno.readTextFile("./README.md");

app.get("/", async (c) => {
  const content = `
    <div id="scroller">
      <div class='message'>
        ${await marked(readme)}
      </div>
    </div>
  `;

  const html = await head("ANProto") + content + await foot();
  return await c.html(html);
});

app.route("/try", tryApp);
app.route("/media", mediaApp);
app.route("/blobs", blobHttpApp);
app.route("/andfs", andfsHttpApp);

app.get("/portfolio", async (c) => {
  const html = await head("ANProto — Portfolio") + portfolio + await foot();
  return await c.html(html);
});

app.use(
  "*",
  serveStatic({
    root: "./",
    onFound: (_path, c) => {
      c.header("Access-Control-Allow-Origin", "*");
    },
  }),
);

export default app;
