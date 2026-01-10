import { Hono } from "jsr:@hono/hono";
import { serveStatic } from "jsr:@hono/hono/deno";

import { foot, head } from "./template.js";

const app = new Hono();

app.use(
  "*",
  serveStatic({
    root: "./",
    onFound: (_path, c) => {
      c.header("Access-Control-Allow-Origin", "*");
    },
  }),
);

app.get("/", async (c) => {
  const body = `<body>
  <div id='scroller'>
  <div class='message'>
  <p><em>An Interactive Demonstration</em></p>

  <p><strong>Step 1.</strong> Generate an ed25519 keypair</p>
  
  <code>const kp = await an.gen()</code>

  <input style='width: 100%;' id='key' placeholder='Make a keypair'></input>

  <button id='but'>Generate keypair</button>

  </div>

  <div class='message'>

  <p><strong>Step 2.</strong> Hash your blob with sha256</p>

  <code>const hash = await an.hash(content)</code>
  
  <input style='width: 100%;' id='content' placeholder='Write a message'></input>

  <button id='hash'>Generate hash</button>

  <span id='sha256'></span>

  </div>

  <div class='message'>

  <p><strong>Step 3.</strong> Sign the ANProto message</p>

  <code>const sig = await an.sign(hash, keypair)</code>

  <input style='width: 100%' id='sig'></input>

  <button id='sign'>Sign message</button>

  </div>
  <div class="message">

  <p><strong>Step 4.</strong> Open the ANProto message</p>

  <code>const opened = await an.open(msg)</code>  

  <input style='width: 100%;' id='openen'></input>

  <button id='open'>Open</button>

  </div>
  <div class="message">

  <p><strong>Step 5.</strong> Retrieve the blob</p>

  <span id='msg'></span>

  <button id='get'>Get</button>

  </div>
</div>
</body>

<script type='module'>
import { an } from './an.js'

const key = document.getElementById('key')
const button = document.getElementById('but')

button.onclick = async () => {
  key.value = await an.gen()
}

const content = document.getElementById('content')
const hashbutton = document.getElementById('hash')
const sha = document.getElementById('sha256')

let blobs = []

hashbutton.onclick = async () => {
  sha.textContent = await an.hash(content.value)
  blobs[sha.textContent] = content.value
}

const siginput = document.getElementById('sig')
const signbutton = document.getElementById('sign')

signbutton.onclick = async () => {
  siginput.value = await an.sign(sha.textContent, key.value)
}

const openbutton = document.getElementById('open')

const openen = document.getElementById('openen')

openbutton.onclick = async () => {
  openen.value = await an.open(siginput.value)
}

const msgspan = document.getElementById('msg')
const getbutton = document.getElementById('get')

getbutton.onclick = async () => {
  msgspan.textContent = blobs[openen.value.substring(13)]
  if (openen.value.substring(13) == sha.textContent) {
    msgspan.textContent = msgspan.textContent + ' ✅'
  } else {
    msgspan.textContent = msgspan.textContent + ' ❌'
  }
}

</script>`;

  const navLabel = `Try <span style="color: #fe7a00;">AN</span>Proto`;
  const html = await head("Try ANProto", navLabel) + body + await foot();
  return await c.html(html);
});

export default app;
