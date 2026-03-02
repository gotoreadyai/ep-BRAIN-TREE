import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import type { PackEntry } from '../../shared/types'
import { fetchCatalog } from '../../shared/github'
import { cacheGet, cacheSet } from '../../shared/cache'

const ORG = 'gniazdo-wiedzy'

export default function Catalog() {
  const [packs, setPacks] = useState<PackEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    (async () => {
      try {
        const data = await fetchCatalog(ORG, 'paczka-bazowa')
        await cacheSet(`catalog:${ORG}`, data)
        setPacks(data)
      } catch {
        const cached = await cacheGet<PackEntry[]>(`catalog:${ORG}`)
        if (cached) setPacks(cached)
        else setError('Brak połączenia i brak cache')
      } finally { setLoading(false) }
    })()
  }, [])

  if (loading) return <div className="h-screen flex items-center justify-center text-white/30">Ładuję katalog...</div>
  if (error) return <div className="h-screen flex items-center justify-center text-red-400">{error}</div>

  return (
    <div className="h-screen flex flex-col items-center justify-center gap-6 p-8">
      <h1 className="text-white text-2xl font-bold">Drzewa wiedzy</h1>
      <div className="grid gap-3 max-w-md w-full">
        {packs.map(p => (
          <Link key={`${p.org}/${p.repo}`} to={`/load/${p.org}/${p.repo}`}
            className="block bg-white/[0.04] hover:bg-white/[0.08] rounded-lg p-4 transition-colors">
            <div className="text-white font-medium">{p.description || p.repo}</div>
            <div className="text-white/30 text-xs mt-1 flex gap-2">
              {p.topics.filter(t => t !== 'brain-tree').map(t => (
                <span key={t} className="px-1.5 py-0.5 rounded bg-white/5">{t}</span>
              ))}
            </div>
          </Link>
        ))}
        {packs.length === 0 && <p className="text-white/20 text-center">Brak paczek w katalogu</p>}
      </div>
    </div>
  )
}
