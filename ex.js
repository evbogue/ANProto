import { a } from "./a.js";

const m = "Hello World";
const h = await a.hash(m);
const k = await a.gen();
const s = await a.sign(m, k);
const o = await a.open(s);

console.log(k);
console.log(h);
console.log(s);
console.log(o);
