// Cache IndexedDB (Dexie) — offline paczki

import Dexie from 'dexie'

const db = new Dexie('brain-tree')
db.version(4).stores({ packs: '' })

const packs = db.table('packs')

export const cacheGet = <T>(key: string) => packs.get(key) as Promise<T | undefined>
export const cacheSet = (key: string, value: unknown) => packs.put(value, key)
