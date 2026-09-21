import { createAndFS } from "./vendor/andfs.js";
import { browserStore, httpStore, memoryStore } from "./andfs_store.js";

const blockStore = typeof indexedDB === "undefined"
  ? memoryStore("local")
  : await browserStore("anproto-media-andfs-v1");
const files = createAndFS({ store: blockStore });
const results = document.getElementById("results");

async function splitAcrossPeers(manifestHash) {
  const peers = [memoryStore("peer-a"), memoryStore("peer-b"), memoryStore("peer-c")];
  await peers[0].put(manifestHash, await files.getBlock(manifestHash));
  const manifest = await files.manifest(manifestHash);
  for (let index = 0; index < manifest.chunks.length; index++) {
    const id = manifest.chunks[index];
    await peers[index % peers.length].put(id, await files.getBlock(id));
  }
  return peers;
}

function mediaKind(file) {
  if (file.type.startsWith("video/")) return "video";
  if (file.type.startsWith("audio/")) return "audio";
  return "file";
}

function playbackUrl(bytes, type) {
  return URL.createObjectURL(new Blob([bytes], { type }));
}

async function addMedia(file, source) {
  const added = await files.add(file);
  const manifestHash = added.manifestHash;
  const restored = await files.get(manifestHash);
  const kind = mediaKind(file);
  const manifest = await files.manifest(manifestHash);
  const artifact = {
    type: kind,
    andfs: manifestHash,
    mime: file.type || "application/octet-stream",
    media_name: file.name || source,
    media_size: file.size,
  };

  const el = document.createElement("div");
  el.className = "message";

  const heading = document.createElement("p");
  const strong = document.createElement("strong");
  strong.textContent = file.name || source;
  heading.append(strong, document.createTextNode(` — ${(file.size / 1024).toFixed(1)} KB`));

  const player = document.createElement(kind === "video" ? "video" : kind === "audio" ? "audio" : "div");
  if (kind !== "file") {
    player.controls = true;
    player.src = playbackUrl(restored, artifact.mime);
    player.style.width = "100%";
    if (kind === "video") player.playsInline = true;
  }

  const verification = document.createElement("p");
  verification.textContent = `AndFS v1 verified ✅ ${manifest.chunks.length} block${manifest.chunks.length === 1 ? "" : "s"}`;

  const idLine = document.createElement("p");
  idLine.style.overflowWrap = "anywhere";
  const code = document.createElement("code");
  code.textContent = manifestHash;
  idLine.appendChild(code);

  const actions = document.createElement("p");
  const httpButton = document.createElement("button");
  httpButton.textContent = "HTTP round trip";
  const peerButton = document.createElement("button");
  peerButton.textContent = "Multi-peer download";
  actions.append(httpButton, document.createTextNode(" "), peerButton);

  const log = document.createElement("pre");
  log.style.whiteSpace = "pre-wrap";
  log.style.overflowWrap = "anywhere";

  httpButton.onclick = async () => {
    httpButton.disabled = true;
    log.textContent = "Uploading verified AndFS blocks through /andfs…";
    try {
      const remote = createAndFS({ store: httpStore("/andfs") });
      const remoteAdded = await remote.add(file);
      const remoteBytes = await remote.get(remoteAdded.manifestHash);
      const ok = remoteAdded.manifestHash === manifestHash && remoteBytes.length === file.size;
      log.textContent = `HTTP round trip: ${ok ? "✅ verified" : "❌ failed"}\n${remoteAdded.manifestHash}`;
    } catch (error) {
      log.textContent = "HTTP round trip failed: " + error.message;
    } finally {
      httpButton.disabled = false;
    }
  };

  peerButton.onclick = async () => {
    peerButton.disabled = true;
    log.textContent = "Distributing AndFS blocks across peer-a, peer-b, peer-c…";
    try {
      const peers = await splitAcrossPeers(manifestHash);
      const recovered = createAndFS({
        store: memoryStore("recovered"),
        sources: peers,
      });
      const bytes = await recovered.get(manifestHash, {
        onProgress: ({ index, total }) => {
          log.textContent = `Verified block ${index}/${total}`;
        },
      });
      const ok = bytes.length === file.size;
      log.textContent += `\n\nReassembled: ${ok ? "✅ verified" : "❌ failed"}`;
    } catch (error) {
      log.textContent += "\nError: " + error.message;
    } finally {
      peerButton.disabled = false;
    }
  };

  const details = document.createElement("details");
  const summary = document.createElement("summary");
  summary.textContent = "ANProto media reference";
  const pre = document.createElement("pre");
  pre.style.whiteSpace = "pre-wrap";
  pre.textContent = JSON.stringify(artifact, null, 2);
  details.append(summary, pre);

  el.append(heading);
  if (kind !== "file") el.append(player);
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
        const mime = recorder.mimeType || (kind === "audio" ? "audio/webm" : "video/webm");
        const file = new File([new Blob(chunks, { type: mime })], `recording-${Date.now()}.webm`, { type: mime });
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
