import nacl from "./lib/nacl-fast-es.js";
import { decode, encode } from "./lib/base64.js";

export const a = {};

a.gen = async () => {
  const g = await nacl.sign.keyPair();
  const k = await encode(g.publicKey) + encode(g.secretKey);
  return k;
};

a.hash = async (d) => {
  return encode(
    Array.from(
      new Uint8Array(
        await crypto.subtle.digest("SHA-256", new TextEncoder().encode(d)),
      ),
    ),
  );
};

a.sign = async (h, k) => {
  const ts = Date.now();
  const s = encode(
    nacl.sign(new TextEncoder().encode(ts + h), decode(k.substring(44))),
  );

  return k.substring(0, 44) + s;
};

a.open = async (m) => {
  const o = new TextDecoder().decode(
    nacl.sign.open(decode(m.substring(44)), decode(m.substring(0, 44))),
  );

  return o;
};
