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

a.sign = async (d, k) => {
  const ts = Date.now();
  const h = await a.hash(d);
  const s = encode(
    nacl.sign(new TextEncoder().encode(ts + h), decode(k.substring(44))),
  );

  return s;
};
