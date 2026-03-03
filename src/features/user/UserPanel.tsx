import { Link, Navigate } from 'react-router-dom'
import { useTreeStore } from '../../shared/store'
import { STATUS_COLOR, STATUS_LABEL, type NodeStatus } from '../../shared/types'

export default function UserPanel() {
  const { def, nodes, edges, nodeStates, resetProgress, setSelectedNode } = useTreeStore()
  if (!def) return <Navigate to="/" replace />

  const total = nodes.length
  const counts: Record<NodeStatus, number> = { mastered: 0, in_progress: 0, available: 0, locked: 0 }
  for (const n of nodes) counts[nodeStates[n.id] ?? 'locked']++
  const pct = total > 0 ? Math.round((counts.mastered / total) * 100) : 0

  /* Minimap: grupuj po backbone tierach */
  const backbone = Object.keys(def.branches).filter(b => b !== 'bridge')[0]
  const tiers = new Map<number, typeof nodes>()
  for (const n of nodes) {
    if (n.branch === 'bridge') continue
    const t = n.tier
    if (!tiers.has(t)) tiers.set(t, [])
    tiers.get(t)!.push(n)
  }
  const bridges = nodes.filter(n => n.branch === 'bridge')

  return (
    <div className="h-full overflow-auto p-4 flex flex-col items-center gap-4">
      <div className="w-full max-w-sm bg-white/[0.04] rounded-xl p-5 text-white space-y-4">
        <h2 className="text-lg font-bold">{def.title}</h2>

        <div>
          <div className="flex justify-between text-xs text-white/40 mb-1">
            <span>Postęp</span><span>{pct}%</span>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          {(Object.keys(counts) as NodeStatus[]).map(s => (
            <Stat key={s} n={counts[s]} label={STATUS_LABEL[s]} color={STATUS_COLOR[s]} />
          ))}
        </div>

        <div className="flex gap-2 text-xs">
          <Link to="/galaxy" className="flex-1 text-center py-1.5 rounded bg-white/10 hover:bg-white/15 transition-colors">
            Wróć do drzewa
          </Link>
          <button onClick={resetProgress}
            className="px-3 py-1.5 rounded bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors">
            Reset
          </button>
        </div>
      </div>

      {/* Minimapa — rozkład materiału */}
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
                  <NodeDot state={nodeStates[sun.id] ?? 'locked'} />
                </div>
              )}
              <div className="ml-5 flex flex-wrap gap-1">
                {planets.map(n => {
                  const st = nodeStates[n.id] ?? 'locked'
                  const col = def.branches[n.branch]?.color ?? '#666'
                  return (
                    <Link key={n.id} to="/galaxy" onClick={() => setSelectedNode(n.id)}
                      className="text-[10px] px-1.5 py-0.5 rounded-full flex items-center gap-1 transition-colors hover:bg-white/10"
                      style={{ background: col + '15', opacity: st === 'locked' ? 0.3 : 1 }}>
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
                const st = nodeStates[n.id] ?? 'locked'
                const col = def.branches.bridge?.color ?? '#fbbf24'
                return (
                  <Link key={n.id} to="/galaxy" onClick={() => setSelectedNode(n.id)}
                    className="text-[10px] px-1.5 py-0.5 rounded flex items-center gap-1 transition-colors hover:bg-white/10"
                    style={{ background: col + '15', opacity: st === 'locked' ? 0.3 : 1 }}>
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

function Stat({ n, label, color }: { n: number; label: string; color: string }) {
  return (
    <div className="bg-white/[0.03] rounded p-2">
      <span className="text-lg font-bold" style={{ color }}>{n}</span>
      <p className="text-white/30">{label}</p>
    </div>
  )
}

function NodeDot({ state }: { state: NodeStatus }) {
  const col = STATUS_COLOR[state]
  return <span className="text-[8px] px-1 py-0.5 rounded-full" style={{ background: col + '20', color: col }}>
    {STATUS_LABEL[state]}
  </span>
}
