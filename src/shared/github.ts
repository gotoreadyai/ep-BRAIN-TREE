import type { PackEntry, PackType } from './types'

const SEARCH = 'https://api.github.com/search/repositories'
const RAW = 'https://raw.githubusercontent.com'
const PACK_TYPES: PackType[] = ['paczka-bazowa', 'paczka-rozszerzenie', 'paczka-kontentowa']
const SYSTEM_TAGS = new Set<string>([...PACK_TYPES, 'brain-tree'])

// Pobierz katalog paczek z GitHub org po topicach
export async function fetchCatalog(org: string, packType?: string): Promise<PackEntry[]> {
  const q = `org:${org}+topic:brain-tree` + (packType ? `+topic:${packType}` : '')
  const res = await fetch(`${SEARCH}?q=${q}&per_page=100`)
  if (!res.ok) throw new Error(`GitHub: ${res.status}`)
  const { items } = await res.json()
  return items.map((r: any) => ({
    org,
    repo: r.name,
    description: r.description ?? '',
    topics: r.topics ?? [],
    packType: PACK_TYPES.find(t => r.topics?.includes(t)) ?? 'paczka-bazowa',
    subject: (r.topics ?? []).find((t: string) => !SYSTEM_TAGS.has(t)) ?? '',
  }))
}

// Pobierz tree.json z repozytorium
export async function fetchPack<T>(org: string, repo: string): Promise<T> {
  const res = await fetch(`${RAW}/${org}/${repo}/main/tree.json`)
  if (!res.ok) throw new Error(`Pack: ${res.status}`)
  return res.json()
}
