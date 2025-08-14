import { a } from "./a.js";

const m = "Hello World";
const k = await a.gen();

console.log(k);
console.log(await a.hash(m));
console.log(await a.sign(m, k));
