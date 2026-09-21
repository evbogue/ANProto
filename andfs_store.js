export function memoryStore(name = "memory") {
  const blocks = new Map();
  return {
    name,
    get: async (id) => blocks.get(id)?.slice(),
    put: async (id, bytes) => {
      blocks.set(id, new Uint8Array(bytes).slice());
    },
    has: async (id) => blocks.has(id),
  };
}

export async function browserStore(name = "andfs-v1") {
  const db = await new Promise((resolve, reject) => {
    const request = indexedDB.open(name, 1);
    request.onupgradeneeded = () => request.result.createObjectStore("blocks");
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

  const transaction = (mode, operation) => new Promise((resolve, reject) => {
    const tx = db.transaction("blocks", mode);
    const request = operation(tx.objectStore("blocks"));
    tx.oncomplete = () => resolve(request.result);
    tx.onabort = tx.onerror = () => reject(tx.error || new Error("IndexedDB failed"));
  });

  return {
    get: (id) => transaction("readonly", (store) => store.get(id)),
    put: (id, bytes) => transaction("readwrite", (store) =>
      store.put(new Uint8Array(bytes).slice(), id)
    ),
    has: async (id) => (await transaction("readonly", (store) => store.getKey(id))) !== undefined,
  };
}

export function httpStore(baseUrl) {
  const root = baseUrl.replace(/\/$/, "");
  return {
    get: async (id) => {
      const response = await fetch(`${root}/${id}`);
      if (response.status === 404) return undefined;
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return new Uint8Array(await response.arrayBuffer());
    },
    put: async (id, bytes) => {
      const response = await fetch(`${root}/${id}`, {
        method: "PUT",
        body: bytes,
      });
      if (!response.ok && response.status !== 204) {
        throw new Error(`HTTP ${response.status}`);
      }
    },
    has: async (id) => (await fetch(`${root}/${id}`, { method: "HEAD" })).ok,
  };
}
