import { Hono } from "jsr:@hono/hono";
import { serveStatic } from 'jsr:@hono/hono/deno'

import { foot, head } from "./template.js";

const app = new Hono();

app.get('/', async (c) => {
  const content = `
    <div id="scroller">
      <div class='message'>
        <h1>AProto</h1>
        <p><a href="./try">Try AProto</a></p>
        <p><a href="https://wiredove.net/">Wiredove</a></p>
      </div>
    </div>
  `

  const html = await head('Index') + content + await foot()
  return await c.html(html)  
})

app.get('/try', async (c) => {

  const body = `<body>
  <div id='scroller'>
  <div class='message'>
  <h1>Try AProto</h1>

  <p><em>An Interactive Demonstration</em></p>

  <p><strong>Step 1.</strong> Generate an ed25519 keypair</p>
  
  <code>const kp = await a.gen()</code>

  <input style='width: 100%;' id='key' placeholder='Make a keypair'></input>

  <button id='but'>Generate keypair</button>

  </div>

  <div class='message'>

  <p><strong>Step 2.</strong> Hash your blob with sha256</p>

  <code>const hash = await a.hash(content)</code>
  
  <input style='width: 100%;' id='content' placeholder='Write a message'></input>

  <button id='hash'>Generate hash</button>

  <span id='sha256'></span>

  </div>

  <div class='message'>

  <p><strong>Step 3.</strong> Sign an AProto message</p>

  <code>const sig = await a.sign(hash, keypair)</code>

  <input style='width: 100%' id='sig'></input>

  <button id='sign'>Sign message</button>

  </div>
  <div class="message">

  <p><strong>Step 4.</strong> Open the AProto message</p>

  <code>const opened = await a.open(msg)</code>  

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
import { a } from './a.js'

const key = document.getElementById('key')
const button = document.getElementById('but')

button.onclick = async () => {
  key.value = await a.gen()
}

const content = document.getElementById('content')
const hashbutton = document.getElementById('hash')
const sha = document.getElementById('sha256')

let blobs = []

hashbutton.onclick = async () => {
  sha.textContent = await a.hash(content.value)
  blobs[sha.textContent] = content.value
}

const siginput = document.getElementById('sig')
const signbutton = document.getElementById('sign')

signbutton.onclick = async () => {
  siginput.value = await a.sign(sha.textContent, key.value)
}

const openbutton = document.getElementById('open')

const openen = document.getElementById('openen')

openbutton.onclick = async () => {
  openen.value = await a.open(siginput.value)
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

</script>`

  const html = await head('Try it') + body + await foot()
  return await c.html(html) 
})

app.use('*', serveStatic({ root: './' }))

export default app
