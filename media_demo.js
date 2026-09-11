import {
  MemoryBlobStore,
  getBlob,
  mediaArtifact,
  putBlob,
  verifyBlob,
} from "./blob.js";

const store = new MemoryBlobStore();
const results = document.getElementById("results");

const esc = (value) => String(value)
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;");

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

  const player = document.createElement(kind === "video" ? "video" : kind === "audio" ? "audio" : "div");
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

  const heading = document.createElement("p");
  heading.innerHTML = `<strong>${esc(file.name || source)}</strong> — ${(file.size / 1024).toFixed(1)} KB`;

  const verification = document.createElement("p");
  verification.textContent = verified ? "Verified ✅" : "Verified ❌";

  const idLine = document.createElement("p");
  idLine.style.overflowWrap = "anywhere";
  const code = document.createElement("code");
  code.textContent = id;
  idLine.appendChild(code);

  const details = document.createElement("details");
  const summary = document.createElement("summary");
  summary.textContent = "ANProto artifact";
  const pre = document.createElement("pre");
  pre.style.whiteSpace = "pre-wrap";
  pre.textContent = JSON.stringify(artifact, null, 2);
  details.append(summary, pre);

  el.append(heading);
  if (kind === "video" || kind === "audio") el.append(player);
  el.append(verification, idLine, details);
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
