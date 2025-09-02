// get an.js working in Node.js -- from  https://github.com/vic/goan/blob/main/js_helper.js

import { createRequire } from 'module';
const require = createRequire(import.meta.url);

globalThis.self = {
  crypto: {
    getRandomValues: (buf) => {
      require('crypto').randomFillSync(buf);
      return buf;
    }
  }
};

if (typeof globalThis.crypto === 'undefined' || typeof globalThis.crypto.subtle === 'undefined') {
  globalThis.crypto = globalThis.crypto || {};
  try {
    globalThis.crypto.subtle = require('crypto').webcrypto.subtle;
  } catch (e) {
    console.log(e)
  }
}

const { an } = await import('./an.js');

const m = "Hello World";
const h = await an.hash(m);
const k = await an.gen();
const s = await an.sign(h, k);
const o = await an.open(s);

console.log(k);
console.log(h);
console.log(s);
console.log(o);
