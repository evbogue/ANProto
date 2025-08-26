import { an } from "./an.js";

const m = "Hello World";
const h = await an.hash(m);
const k = await an.gen();
const s = await an.sign(m, k);
const o = await an.open(s);

console.log(k);
console.log(h);
console.log(s);
console.log(o);
