import {
  MemoryBlobStore,
  getBlob,
  mediaArtifact,
  putBlob,
  verifyBlob,
} from "../blob.js";

const store = new MemoryBlobStore();

// The bytes could come from fetch(), an <input type=file>, MediaRecorder,
// Deno.readFile(), Bluetooth, SSB, IPFS, or any other transport.
const bytes = new TextEncoder().encode("pretend these are audio bytes");

const blob = await putBlob(bytes, store);

console.log("blob:", blob);
console.log("verified:", await verifyBlob(blob, bytes));

const artifact = mediaArtifact({
  blob,
  mime: "audio/webm",
  name: "field-note.webm",
});

console.log("artifact:", artifact);
console.log("round trip:", new TextDecoder().decode(await getBlob(blob, store)));
