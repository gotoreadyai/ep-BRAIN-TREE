// Minimalny cache IndexedDB — offline po pierwszym pobraniu

const DB = 'brain-tree', STORE = 'packs'

function open(): Promise<IDBDatabase> {
  return new Promise((ok, fail) => {
    const req = indexedDB.open(DB, 1)
    req.onupgradeneeded = () => req.result.createObjectStore(STORE)
    req.onsuccess = () => ok(req.result)
    req.onerror = () => fail(req.error)
  })
}

export async function cacheGet<T>(key: string): Promise<T | undefined> {
  const db = await open()
  return new Promise((ok) => {
    const req = db.transaction(STORE, 'readonly').objectStore(STORE).get(key)
    req.onsuccess = () => ok(req.result)
    req.onerror = () => ok(undefined)
  })
}

export async function cacheSet(key: string, value: unknown): Promise<void> {
  const db = await open()
  return new Promise((ok, fail) => {
    const tx = db.transaction(STORE, 'readwrite')
    tx.objectStore(STORE).put(value, key)
    tx.oncomplete = () => ok()
    tx.onerror = () => fail(tx.error)
  })
}
