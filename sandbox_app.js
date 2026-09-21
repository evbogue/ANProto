import { an } from "./an.js";

const KEY_NAME = "anproto-sandbox-keypair-v1";
const POSTS_NAME = "anproto-sandbox-posts-v1";

const body = document.querySelector("#sandbox-body");
const publish = document.querySelector("#sandbox-publish");
const identity = document.querySelector("#sandbox-identity");
const notice = document.querySelector("#sandbox-notice");
const feed = document.querySelector("#sandbox-feed");
const empty = document.querySelector("#sandbox-empty");

const readPosts = () => {
  try {
    return JSON.parse(localStorage.getItem(POSTS_NAME) || "[]");
  } catch {
    return [];
  }
};

const identityLabel = (keypair) => `Local identity: ${keypair.slice(0, 12)}…`;

const render = async () => {
  const keypair = localStorage.getItem(KEY_NAME);
  identity.textContent = keypair ? identityLabel(keypair) : "No local identity yet";
  const posts = readPosts();
  empty.hidden = posts.length > 0;
  feed.replaceChildren();

  for (const post of posts) {
    const card = document.createElement("article");
    card.className = "sandbox-post";

    const meta = document.createElement("div");
    meta.className = "sandbox-post-meta";
    const opened = await an.open(post.message);
    const signedAt = Number(opened.slice(0, -post.hash.length));
    const verified = Number.isFinite(signedAt) && opened.endsWith(post.hash);
    meta.textContent = `${new Date(signedAt).toLocaleString()} · ${verified ? "signature verified" : "could not verify"}`;

    const text = document.createElement("p");
    text.textContent = post.body;
    const detail = document.createElement("details");
    const summary = document.createElement("summary");
    summary.textContent = "Show signed message";
    const raw = document.createElement("code");
    raw.textContent = post.message;
    detail.append(summary, raw);
    card.append(meta, text, detail);
    feed.append(card);
  }
};

publish.addEventListener("click", async () => {
  const text = body.value.trim();
  if (!text) {
    notice.textContent = "Write something first.";
    return;
  }

  publish.disabled = true;
  try {
    let keypair = localStorage.getItem(KEY_NAME);
    if (!keypair) {
      keypair = await an.gen();
      localStorage.setItem(KEY_NAME, keypair);
    }
    const timestamp = Date.now();
    const hash = await an.hash(text);
    const message = await an.sign(hash, keypair);
    const posts = readPosts();
    posts.unshift({ body: text, hash, message, timestamp });
    localStorage.setItem(POSTS_NAME, JSON.stringify(posts));
    body.value = "";
    notice.textContent = "Signed and saved in this browser only.";
    await render();
  } catch {
    notice.textContent = "This browser could not save the post locally.";
  } finally {
    publish.disabled = false;
  }
});

render();
