// Minimalny cache IndexedDB — offline po pierwszym pobraniu + zapis odkryć

import type { DiscoveryEdge } from './types'

const DB = 'brain-tree', STORE = 'packs', DISC = 'discovery'

function open(): Promise<IDBDatabase> {
  return new Promise((ok, fail) => {
    const req = indexedDB.open(DB, 2)
    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE)
      if (!db.objectStoreNames.contains(DISC)) db.createObjectStore(DISC, { keyPath: 'id' })
    }
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

// --- Odkrycia (discovery edges) ---

export async function discSave(edge: DiscoveryEdge): Promise<void> {
  const db = await open()
  return new Promise((ok, fail) => {
    const tx = db.transaction(DISC, 'readwrite')
    tx.objectStore(DISC).put(edge)
    tx.oncomplete = () => ok()
    tx.onerror = () => fail(tx.error)
  })
}

export async function discGetAll(treeId: string): Promise<DiscoveryEdge[]> {
  const db = await open()
  return new Promise((ok) => {
    const req = db.transaction(DISC, 'readonly').objectStore(DISC).getAll()
    req.onsuccess = () => ok((req.result as DiscoveryEdge[]).filter(e => e.treeId === treeId))
    req.onerror = () => ok([])
  })
}

export async function discClear(treeId: string): Promise<void> {
  const edges = await discGetAll(treeId)
  if (!edges.length) return
  const db = await open()
  return new Promise((ok, fail) => {
    const tx = db.transaction(DISC, 'readwrite')
    const store = tx.objectStore(DISC)
    for (const e of edges) store.delete(e.id)
    tx.oncomplete = () => ok()
    tx.onerror = () => fail(tx.error)
  })
}
