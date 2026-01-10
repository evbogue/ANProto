import tryApp from "./try_app.js";

const port = 8788;
const hostname = "::";

Deno.serve({ port, hostname }, tryApp.fetch);
