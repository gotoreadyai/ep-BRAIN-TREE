// Cache IndexedDB (Dexie) — offline paczki + odkrycia

import Dexie from 'dexie'
import type { DiscoveryEdge } from './types'

const db = new Dexie('brain-tree')
db.version(3).stores({
  packs: '',            // klucz zewnętrzny (outbound)
  discovery: 'id, treeId',
})

const packs = db.table('packs')
const disc = db.table<DiscoveryEdge>('discovery')

export const cacheGet = <T>(key: string) => packs.get(key) as Promise<T | undefined>
export const cacheSet = (key: string, value: unknown) => packs.put(value, key)

export const discSave = (edge: DiscoveryEdge) => disc.put(edge)
export const discGetAll = (treeId: string) => disc.where('treeId').equals(treeId).toArray()
export const discClear = (treeId: string) => disc.where('treeId').equals(treeId).delete().then(() => {})
