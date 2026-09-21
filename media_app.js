import { Hono } from "jsr:@hono/hono";
import { foot, head } from "./template.js";

const app = new Hono();

app.get("/", async (c) => {
  const body = `
  <div id="scroller">
    <div class="message">
      <h1>ANProto media: AndFS v1</h1>
      <p>Upload media from your phone, or record directly with the camera/microphone. Files use AndFS v1: verified 256 KiB blocks plus one manifest hash.</p>

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

      <h3>Network demos</h3>
      <p>After adding media, each result includes:</p>
      <ul>
        <li><strong>HTTP round trip</strong> — upload/download verified AndFS blocks through the demo server.</li>
        <li><strong>Multi-peer download</strong> — distribute AndFS blocks across three peers and reconstruct the file.</li>
      </ul>
    </div>

    <div id="results"></div>
  </div>

  <script type="module" src="/media_demo.js"></script>
  `;

  return c.html(await head("ANProto Media: AndFS v1", "Media") + body + await foot());
});

export default app;
