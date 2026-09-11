import { Hono } from "jsr:@hono/hono";
import { foot, head } from "./template.js";

const app = new Hono();

app.get("/", async (c) => {
  const body = `
  <div id="scroller">
    <div class="message">
      <h1>ANProto blobs: audio + video</h1>
      <p>Upload media from your phone, or record directly with the camera/microphone. The bytes are content-addressed, verified, and then played back from the blob store.</p>

      <h3>Upload</h3>
      <input id="upload" type="file" accept="audio/*,video/*" multiple>
      <p><small>On phones, your browser may offer camera, microphone, or photo-library sources.</small></p>

      <h3>Record audio</h3>
      <button id="startAudio">Start audio</button>
      <button id="stopAudio" disabled>Stop audio</button>

      <h3>Record video</h3>
      <video id="preview" autoplay muted playsinline style="width:100%;max-width:480px;display:none"></video>
      <button id="startVideo">Start video</button>
      <button id="stopVideo" disabled>Stop video</button>

      <p><small>Recording requires HTTPS (or localhost) and browser permission.</small></p>
    </div>

    <div id="results"></div>
  </div>

  <script type="module">
    import {
      MemoryBlobStore,
      getBlob,
      mediaArtifact,
      putBlob,
      verifyBlob,
    } from "/blob.js";

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
      const playable = new Blob([restored], { type: file.type || "application/octet-stream" });
      const url = URL.createObjectURL(playable);
      const kind = file.type.startsWith("video/") ? "video" : file.type.startsWith("audio/") ? "audio" : "file";
      const artifact = mediaArtifact({
        blob: id,
        mime: file.type,
        name: file.name || source,
        source,
      });

      const el = document.createElement("div");
      el.className = "message";
      const player = kind === "video"
        ? `<video controls playsinline src="${url}" style="width:100%;max-width:640px"></video>`
        : kind === "audio"
        ? `<audio controls src="${url}" style="width:100%"></audio>`
        : "";

      el.innerHTML = `
        <p><strong>${esc(file.name || source)}</strong> — ${(file.size / 1024).toFixed(1)} KB</p>
        ${player}
        <p>Verified: <strong>${verified ? "✅" : "❌"}</strong></p>
        <p style="overflow-wrap:anywhere"><code>${esc(id)}</code></p>
        <details>
          <summary>ANProto artifact</summary>
          <pre style="white-space:pre-wrap">${esc(JSON.stringify(artifact, null, 2))}</pre>
        </details>
      `;

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
          const blob = new Blob(chunks, { type: mime });
          const ext = mime.includes("mp4") ? "mp4" : "webm";
          const file = new File([blob], `recording-${Date.now()}.${ext}`, { type: mime });
          stream.getTracks().forEach((track) => track.stop());
          preview.srcObject = null;
          preview.style.display = "none";
          await addMedia(file, "recorded " + kind);
        };

        recorder.start();
        start.disabled = true;
        stop.disabled = false;
      };

      stop.onclick = () => {
        if (recorder?.state === "recording") recorder.stop();
        start.disabled = false;
        stop.disabled = true;
      };
    }

    recorderControls("audio");
    recorderControls("video");
  </script>
  `;

  return c.html(await head("ANProto Media Blobs", "Media Blobs") + body + await foot());
});

export default app;
