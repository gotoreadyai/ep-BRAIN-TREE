import { useEffect, useState } from 'react'
import { useTreeStore } from '../../shared/store'
import { fetchCatalog, fetchPack, ORG } from '../../shared/github'
import { cacheGet, cacheSet } from '../../shared/cache'
import type { PackEntry, TreePack } from '../../shared/types'
import { Puzzle } from 'lucide-react'

export default function ExtensionShelf() {
  const { def, extensions, loadedExtensions, setExtensions, loadExtension } = useTreeStore()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState<string | null>(null)

  // Pobierz dostępne rozszerzenia po załadowaniu drzewa
  useEffect(() => {
    if (!def) return
    const key = `ext:${ORG}`
    ;(async () => {
      try {
        const exts = await fetchCatalog(ORG, 'paczka-rozszerzenie')
        await cacheSet(key, exts)
        setExtensions(exts)
      } catch {
        const cached = await cacheGet<PackEntry[]>(key)
        if (cached) setExtensions(cached)
        else alert('Nie udało się pobrać listy rozszerzeń')
      }
    })()
  }, [def?.id, setExtensions])

  const available = extensions.filter(e => !loadedExtensions.has(e.repo))
  if (available.length === 0) return null

  const handleLoad = async (ext: PackEntry) => {
    setLoading(ext.repo)
    try {
      const pack = await fetchPack<TreePack>(ext.org, ext.repo)
      await cacheSet(`${ext.org}/${ext.repo}`, pack)
      loadExtension(pack, ext.repo)
    } catch { alert('Nie udało się załadować rozszerzenia') }
    setLoading(null)
  }

  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-purple-500/20 text-purple-300 text-xs hover:bg-purple-500/30 transition-colors">
        <Puzzle size={12} />
        <span>{available.length}</span>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-64 bg-black/90 backdrop-blur-sm rounded-lg p-2 space-y-2 z-20">
          {available.map(ext => (
            <div key={ext.repo} className="text-xs">
              <p className="text-white font-medium">{ext.description || ext.repo}</p>
              <button onClick={() => handleLoad(ext)} disabled={loading === ext.repo}
                className="mt-1 px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 hover:bg-purple-500/40 disabled:opacity-30 transition-colors">
                {loading === ext.repo ? 'Ładuję...' : 'Załaduj'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
