import {
  HttpBlobStore,
  IndexedDBBlobStore,
  MemoryBlobStore,
  downloadBlob,
  getBlob,
  mediaArtifact,
  putBlob,
  streamBlob,
  verifyBlob,
} from "./blob.js";

const store = typeof indexedDB === "undefined"
  ? new MemoryBlobStore()
  : new IndexedDBBlobStore("anproto-media-demo");

const results = document.getElementById("results");

function namedStore(name) {
  const inner = new MemoryBlobStore();
  return {
    name,
    put: (id, bytes) => inner.put(id, bytes),
    get: (id) => inner.get(id),
    has: (id) => inner.has(id),
  };
}

async function splitAcrossPeers(id) {
  const peers = [
    namedStore("peer-a"),
    namedStore("peer-b"),
    namedStore("peer-c"),
  ];

  const root = await store.get(id);
  if (!root) throw new Error("local blob is missing");

  if (id.startsWith("anblob:v1:raw:")) {
    await peers[0].put(id, root);
    return peers;
  }

  const manifest = JSON.parse(new TextDecoder().decode(root));
  await peers[0].put(id, root);

  for (let i = 0; i < manifest.chunks.length; i++) {
    const chunk = manifest.chunks[i];
    const bytes = await store.get(chunk.id);
    await peers[i % peers.length].put(chunk.id, bytes);
  }

  return peers;
}

async function appendStreamToMedia(player, mime, stream, log) {
  if (
    typeof MediaSource === "undefined" ||
    !MediaSource.isTypeSupported(mime)
  ) {
    const blob = await new Response(stream).blob();
    player.src = URL.createObjectURL(new Blob([blob], { type: mime }));
    log.textContent += "\nMediaSource unsupported for this MIME; fell back to verified full-blob playback.";
    return;
  }

  const mediaSource = new MediaSource();
  player.src = URL.createObjectURL(mediaSource);

  await new Promise((resolve) => {
    mediaSource.addEventListener("sourceopen", resolve, { once: true });
  });

  const sourceBuffer = mediaSource.addSourceBuffer(mime);
  const reader = stream.getReader();

  const append = (bytes) => new Promise((resolve, reject) => {
    const done = () => {
      sourceBuffer.removeEventListener("updateend", done);
      sourceBuffer.removeEventListener("error", fail);
      resolve();
    };
    const fail = () => {
      sourceBuffer.removeEventListener("updateend", done);
      sourceBuffer.removeEventListener("error", fail);
      reject(new Error("MediaSource append failed"));
    };
    sourceBuffer.addEventListener("updateend", done);
    sourceBuffer.addEventListener("error", fail);
    sourceBuffer.appendBuffer(bytes);
  });

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    await append(value);
  }

  if (mediaSource.readyState === "open") mediaSource.endOfStream();
}

async function addMedia(file, source) {
  const bytes = new Uint8Array(await file.arrayBuffer());
  const id = await putBlob(bytes, store);
  const verified = await verifyBlob(id, bytes);
  const restored = await getBlob(id, store);
  const playable = new Blob([restored], {
    type: file.type || "application/octet-stream",
  });
  const url = URL.createObjectURL(playable);
  const kind = file.type.startsWith("video/")
    ? "video"
    : file.type.startsWith("audio/")
    ? "audio"
    : "file";

  const artifact = mediaArtifact({
    blob: id,
    mime: file.type,
    name: file.name || source,
    source,
  });

  const el = document.createElement("div");
  el.className = "message";

  const heading = document.createElement("p");
  const strong = document.createElement("strong");
  strong.textContent = file.name || source;
  heading.append(strong, document.createTextNode(
    ` — ${(file.size / 1024).toFixed(1)} KB`,
  ));

  const player = document.createElement(
    kind === "video" ? "video" : kind === "audio" ? "audio" : "div",
  );
  if (kind === "video" || kind === "audio") {
    player.controls = true;
    player.src = url;
    if (kind === "video") {
      player.playsInline = true;
      player.style.width = "100%";
      player.style.maxWidth = "640px";
    } else {
      player.style.width = "100%";
    }
  }

  const verification = document.createElement("p");
  verification.textContent = verified ? "Verified ✅" : "Verified ❌";

  const idLine = document.createElement("p");
  idLine.style.overflowWrap = "anywhere";
  const code = document.createElement("code");
  code.textContent = id;
  idLine.appendChild(code);

  const actions = document.createElement("p");

  const httpButton = document.createElement("button");
  httpButton.textContent = "HTTP round trip";

  const peerButton = document.createElement("button");
  peerButton.textContent = "Multi-peer download";

  const streamButton = document.createElement("button");
  streamButton.textContent = "Stream from peers";
  streamButton.disabled = !(kind === "video" || kind === "audio");

  actions.append(httpButton, document.createTextNode(" "), peerButton);
  if (kind === "video" || kind === "audio") {
    actions.append(document.createTextNode(" "), streamButton);
  }

  const log = document.createElement("pre");
  log.style.whiteSpace = "pre-wrap";
  log.style.overflowWrap = "anywhere";

  httpButton.onclick = async () => {
    httpButton.disabled = true;
    log.textContent = "Uploading blob pieces through /blobs…";
    try {
      const http = new HttpBlobStore("/blobs");
      const remoteId = await putBlob(bytes, http);
      const remoteBytes = await getBlob(remoteId, http);
      const ok = await verifyBlob(remoteId, remoteBytes);
      log.textContent = `HTTP round trip: ${ok ? "✅ verified" : "❌ failed"}\n${remoteId}`;
    } catch (error) {
      log.textContent = "HTTP round trip failed: " + error.message;
    } finally {
      httpButton.disabled = false;
    }
  };

  peerButton.onclick = async () => {
    peerButton.disabled = true;
    log.textContent = "Distributing pieces across peer-a, peer-b, peer-c…\n";
    try {
      const peers = await splitAcrossPeers(id);
      const pieceLines = [];
      const rebuilt = await downloadBlob(id, peers, {
        concurrency: 3,
        random: Math.random,
        onChunk: ({ index, total, source }) => {
          pieceLines[index] = `piece ${index + 1}/${total} ← ${source}`;
          log.textContent = pieceLines.filter(Boolean).join("\n");
        },
      });

      const ok = await verifyBlob(id, rebuilt);
      log.textContent += `\n\nReassembled: ${ok ? "✅ verified" : "❌ failed"}`;
    } catch (error) {
      log.textContent += "\nError: " + error.message;
    } finally {
      peerButton.disabled = false;
    }
  };

  streamButton.onclick = async () => {
    streamButton.disabled = true;
    log.textContent = "Preparing peers…\n";
    try {
      const peers = await splitAcrossPeers(id);
      const streamedPlayer = document.createElement(kind === "video" ? "video" : "audio");
      streamedPlayer.controls = true;
      if (kind === "video") {
        streamedPlayer.playsInline = true;
        streamedPlayer.style.width = "100%";
        streamedPlayer.style.maxWidth = "640px";
      } else {
        streamedPlayer.style.width = "100%";
      }

      el.insertBefore(streamedPlayer, log);

      const pieceLines = [];
      const readable = streamBlob(id, peers, {
        random: Math.random,
        onChunk: ({ index, total, source }) => {
          pieceLines[index] = `stream piece ${index + 1}/${total} ← ${source}`;
          log.textContent = pieceLines.filter(Boolean).join("\n");
        },
      });

      await appendStreamToMedia(
        streamedPlayer,
        file.type || "application/octet-stream",
        readable,
        log,
      );

      log.textContent += "\n\nStream complete ✅";
      streamedPlayer.play().catch(() => {});
    } catch (error) {
      log.textContent += "\nStreaming failed: " + error.message;
    } finally {
      streamButton.disabled = false;
    }
  };

  const details = document.createElement("details");
  const summary = document.createElement("summary");
  summary.textContent = "ANProto artifact";
  const pre = document.createElement("pre");
  pre.style.whiteSpace = "pre-wrap";
  pre.textContent = JSON.stringify(artifact, null, 2);
  details.append(summary, pre);

  el.append(heading);
  if (kind === "video" || kind === "audio") el.append(player);
  el.append(verification, idLine, actions, log, details);
  results.prepend(el);
}

document.getElementById("upload").addEventListener("change", async (event) => {
  for (const file of event.target.files) await addMedia(file, "upload");
  event.target.value = "";
});

function recorderControls(kind) {
  const start = document.getElementById(kind === "audio" ? "startAudio" : "startVideo");
  const stop = document.getElementById(kind === "audio" ? "stopAudio" : "stopVideo");
  const preview = document.getElementById("preview");
  let recorder;
  let stream;
  let chunks = [];

  start.onclick = async () => {
    try {
      stream = await navigator.mediaDevices.getUserMedia(
        kind === "audio" ? { audio: true } : { video: true, audio: true },
      );

      if (kind === "video") {
        preview.srcObject = stream;
        preview.style.display = "block";
      }

      chunks = [];
      recorder = new MediaRecorder(stream);
      recorder.ondataavailable = (event) => {
        if (event.data.size) chunks.push(event.data);
      };

      recorder.onstop = async () => {
        const mime = recorder.mimeType ||
          (kind === "audio" ? "audio/webm" : "video/webm");
        const blob = new Blob(chunks, { type: mime });
        const ext = mime.includes("mp4") ? "mp4" : "webm";
        const file = new File(
          [blob],
          `recording-${Date.now()}.${ext}`,
          { type: mime },
        );

        stream.getTracks().forEach((track) => track.stop());
        preview.srcObject = null;
        preview.style.display = "none";
        await addMedia(file, "recorded " + kind);
      };

      recorder.start();
      start.disabled = true;
      stop.disabled = false;
    } catch (error) {
      alert("Could not start " + kind + " recording: " + error.message);
    }
  };

  stop.onclick = () => {
    if (recorder?.state === "recording") recorder.stop();
    start.disabled = false;
    stop.disabled = true;
  };
}

recorderControls("audio");
recorderControls("video");
