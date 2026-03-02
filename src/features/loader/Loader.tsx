import { useEffect, useState } from 'react'
import { useParams, Navigate } from 'react-router-dom'
import type { SkillTreeDef } from '../../shared/types'
import { fetchPack } from '../../shared/github'
import { cacheGet, cacheSet } from '../../shared/cache'
import { useTreeStore } from '../../shared/store'

export default function Loader() {
  const { org, repo } = useParams<{ org: string; repo: string }>()
  const load = useTreeStore(s => s.load)
  const [ready, setReady] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!org || !repo) return
    setReady(false)
    const key = `${org}/${repo}`
    ;(async () => {
      try {
        const data = await fetchPack<SkillTreeDef>(org, repo)
        await cacheSet(key, data)
        load(data)
      } catch {
        const cached = await cacheGet<SkillTreeDef>(key)
        if (cached) load(cached)
        else { setError('Nie udało się pobrać paczki'); return }
      }
      setReady(true)
    })()
  }, [org, repo, load])

  if (error) return <div className="h-screen flex items-center justify-center text-red-400">{error}</div>
  if (ready) return <Navigate to="/metro" replace />
  return <div className="h-screen flex items-center justify-center text-white/30">Ładuję drzewo...</div>
}
