import { useTreeStore } from '../../shared/store'
import type { NodeStatus } from '../../shared/types'

const label: Record<NodeStatus, string> = {
  mastered: 'Opanowane', in_progress: 'W trakcie', available: 'Dostępne', locked: 'Zablokowane'
}
const color: Record<NodeStatus, string> = {
  mastered: '#22c55e', in_progress: '#eab308', available: '#3b82f6', locked: '#6b7280'
}

export default function NodePanel() {
  const { def, nodeMap, edges, selectedNodeId, nodeStates, reviewDue, content, progressNode } = useTreeStore()
  const node = selectedNodeId ? nodeMap.get(selectedNodeId) : undefined
  if (!def || !node) return null

  const state = nodeStates[node.id] ?? 'locked'
  const review = reviewDue.has(node.id)
  const branch = def.branches[node.branch]
  const conns = edges.filter(e => e.from === node.id || e.to === node.id)
  const items = content[node.id] ?? []

  return (
    <div className="absolute top-3 right-3 w-64 bg-black/80 backdrop-blur-sm rounded-lg p-3 text-white">
      <div className="flex items-center gap-2 mb-1">
        <span className={`w-2.5 h-2.5 ${node.branch === 'bridge' ? 'rotate-45' : 'rounded-full'}`}
          style={{ background: branch?.color }} />
        <span className="text-[10px] text-gray-400 uppercase tracking-wide">{branch?.label}</span>
      </div>
      <h3 className="font-bold leading-tight">{node.title}</h3>

      <div className="flex items-center gap-1.5 mt-1">
        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/5" style={{ color: color[state] }}>
          {label[state]}
        </span>
        {review && (
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400">Do powtórki</span>
        )}
      </div>

      {(state === 'available' || state === 'in_progress') && (
        <button onClick={() => progressNode(node.id)}
          className="mt-2 w-full text-xs py-1 rounded transition-colors"
          style={{ background: color[state] + '20', color: color[state] }}>
          {state === 'available' ? 'Rozpocznij' : 'Opanowane!'}
        </button>
      )}

      {node.branch === 'bridge' && node.bridgeTo && (
        <p className="text-sm mt-1" style={{ color: def.branches.bridge?.color }}>→ {node.bridgeTo}</p>
      )}
      {node.description && <p className="text-gray-400 text-xs mt-1">{node.description}</p>}
      {node.terms && node.terms.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {node.terms.map(t => (
            <span key={t} className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-gray-300">{t}</span>
          ))}
        </div>
      )}
      {conns.length > 0 && (
        <div className="mt-2 pt-2 border-t border-white/10 space-y-1">
          {conns.map(c => {
            const otherId = c.from === node.id ? c.to : c.from
            const other = nodeMap.get(otherId)
            return other ? (
              <div key={otherId} className="flex items-center gap-1.5 text-xs">
                <span className={`w-1.5 h-1.5 ${other.branch === 'bridge' ? 'rotate-45' : 'rounded-full'}`}
                  style={{ background: def.branches[other.branch]?.color }} />
                <span className="text-gray-300">{other.title}</span>
              </div>
            ) : null
          })}
        </div>
      )}
      {items.length > 0 && (
        <div className="mt-2 pt-2 border-t border-white/10 space-y-1.5">
          {items.map((item, i) => (
            <div key={i} className="text-xs">
              <span className="text-[9px] uppercase tracking-wider text-white/20">{item.type}</span>
              <p className="text-gray-300">{item.text}</p>
              {item.answer && <p className="text-gray-500 text-[11px] mt-0.5">→ {item.answer}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
