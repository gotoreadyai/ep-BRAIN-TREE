import { Link, Navigate } from 'react-router-dom'
import { useTreeStore } from '../../shared/store'

export default function UserPanel() {
  const { def, nodes, setSelectedNode } = useTreeStore()
  if (!def) return <Navigate to="/" replace />

  const backbone = Object.keys(def.branches).filter(b => b !== 'bridge')[0]
  const tiers = new Map<number, typeof nodes>()
  for (const n of nodes) {
    if (n.branch === 'bridge') continue
    if (!tiers.has(n.tier)) tiers.set(n.tier, [])
    tiers.get(n.tier)!.push(n)
  }
  const bridges = nodes.filter(n => n.branch === 'bridge')

  return (
    <div className="h-full overflow-auto p-4 flex flex-col items-center gap-4">
      <div className="w-full max-w-sm bg-white/[0.04] rounded-xl p-5 text-white space-y-4">
        <h2 className="text-lg font-bold">{def.title}</h2>
        <p className="text-white/40 text-xs">{nodes.length} węzłów</p>

        <Link to="/galaxy" className="block text-center text-xs py-1.5 rounded bg-white/10 hover:bg-white/15 transition-colors">
          Wróć do drzewa
        </Link>
      </div>

      <div className="w-full max-w-sm bg-white/[0.04] rounded-xl p-4 text-white space-y-3">
        <h3 className="text-xs text-white/30 uppercase tracking-wider">Rozkład materiału</h3>

        {[...tiers].sort((a, b) => a[0] - b[0]).map(([tier, tierNodes]) => {
          const sun = tierNodes.find(n => n.branch === backbone)
          const planets = tierNodes.filter(n => n.branch !== backbone)
          return (
            <div key={tier}>
              {sun && (
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: def.branches[backbone]?.color }} />
                  <span className="text-sm font-semibold">{sun.title}</span>
                </div>
              )}
              <div className="ml-5 flex flex-wrap gap-1">
                {planets.map(n => {
                  const col = def.branches[n.branch]?.color ?? '#666'
                  return (
                    <Link key={n.id} to="/galaxy" onClick={() => setSelectedNode(n.id)}
                      className="text-[10px] px-1.5 py-0.5 rounded-full flex items-center gap-1 transition-colors hover:bg-white/10"
                      style={{ background: col + '15' }}>
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: col }} />
                      {n.title}
                    </Link>
                  )
                })}
              </div>
            </div>
          )
        })}

        {bridges.length > 0 && (
          <div className="pt-2 border-t border-white/10">
            <div className="text-[10px] text-white/20 uppercase tracking-wider mb-1">Mosty</div>
            <div className="flex flex-wrap gap-1">
              {bridges.map(n => {
                const col = def.branches.bridge?.color ?? '#fbbf24'
                return (
                  <Link key={n.id} to="/galaxy" onClick={() => setSelectedNode(n.id)}
                    className="text-[10px] px-1.5 py-0.5 rounded flex items-center gap-1 transition-colors hover:bg-white/10"
                    style={{ background: col + '15' }}>
                    <span className="w-1.5 h-1.5 rotate-45" style={{ background: col }} />
                    {n.title}
                  </Link>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
