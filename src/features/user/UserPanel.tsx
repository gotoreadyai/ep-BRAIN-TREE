import { Link, Navigate } from 'react-router-dom'
import { useTreeStore } from '../../shared/store'
import { STATUS_COLOR, STATUS_LABEL, type NodeStatus } from '../../shared/types'

export default function UserPanel() {
  const { def, nodes, nodeStates, resetProgress } = useTreeStore()
  if (!def) return <Navigate to="/" replace />

  const total = nodes.length
  const counts: Record<NodeStatus, number> = { mastered: 0, in_progress: 0, available: 0, locked: 0 }
  for (const n of nodes) counts[nodeStates[n.id] ?? 'locked']++
  const pct = Math.round((counts.mastered / total) * 100)

  return (
    <div className="h-full flex items-center justify-center">
      <div className="w-72 bg-white/[0.04] rounded-xl p-5 text-white space-y-4">
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
          <Link to="/metro" className="flex-1 text-center py-1.5 rounded bg-white/10 hover:bg-white/15 transition-colors">
            Wróć do drzewa
          </Link>
          <button onClick={resetProgress}
            className="px-3 py-1.5 rounded bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors">
            Reset
          </button>
        </div>
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
