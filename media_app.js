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

  <script type="module" src="/media_demo.js"></script>
  `;

  return c.html(await head("ANProto Media Blobs", "Media Blobs") + body + await foot());
});

export default app;
