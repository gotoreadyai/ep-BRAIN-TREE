import { useEffect } from 'react'
import { useTreeStore } from '../../shared/store'
import { STATUS_LABEL as label, STATUS_COLOR as color } from '../../shared/types'

export default function NodePanel() {
  const { def, nodeMap, edges, selectedNodeId, nodeStates, content, coins, revealed,
    discoveryMap, progressNode, revealItem, recordDiscovery, setSelectedNode } = useTreeStore()
  const node = selectedNodeId ? nodeMap.get(selectedNodeId) : undefined
  const items = node ? (content[node.id] ?? []) : []

  // Rejestruj odkrycie darmowych elementów przy otwarciu panelu
  useEffect(() => {
    if (!node) return
    items.forEach((item, i) => {
      if ((item.cost ?? 0) === 0) recordDiscovery(node.id, i)
    })
  }, [selectedNodeId]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!def || !node) return null

  const state = nodeStates[node.id] ?? 'locked'
  const branch = def.branches[node.branch]
  const conns = edges.filter(e => e.from === node.id || e.to === node.id)
  const strength = discoveryMap[node.id] ?? 0

  const handleReveal = (nodeId: string, index: number) => {
    revealItem(nodeId, index)
    recordDiscovery(nodeId, index)
  }

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
        {strength > 0 && (
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/5 text-emerald-400">
            {Math.round(strength * 100)}% pamięci
          </span>
        )}
      </div>

      {(state === 'available' || state === 'in_progress') && (
        <button onClick={() => progressNode(node.id)}
          className="mt-2 w-full text-xs py-1 rounded transition-colors"
          style={{ background: color[state] + '20', color: color[state] }}>
          {state === 'available' ? 'Rozpocznij' : 'Opanowane!'}
        </button>
      )}

      {state === 'mastered' && (() => {
        const next = conns.map(c => nodeMap.get(c.from === node.id ? c.to : c.from))
          .filter((n): n is NonNullable<typeof n> => !!n && nodeStates[n.id] === 'available')
        return next.length > 0 && (
          <div className="mt-2 pt-2 border-t border-white/10">
            <p className="text-[10px] text-white/30 uppercase tracking-wider mb-1">Co dalej?</p>
            {next.map(n => (
              <button key={n.id} onClick={() => setSelectedNode(n.id)}
                className="w-full text-left text-xs py-1 px-1.5 rounded hover:bg-white/5 flex items-center gap-1.5">
                <span className={`w-1.5 h-1.5 ${n.branch === 'bridge' ? 'rotate-45' : 'rounded-full'}`}
                  style={{ background: def.branches[n.branch]?.color }} />
                <span className="text-gray-300">{n.title}</span>
              </button>
            ))}
          </div>
        )
      })()}

      {node.branch === 'bridge' && node.bridgeTo && (
        <p className="text-sm mt-1" style={{ color: def.branches.bridge?.color }}>→ {node.bridgeTo}</p>
      )}
      {node.description && <p className="text-gray-400 text-xs mt-1">{node.description}</p>}
      {conns.length > 0 && (
        <div className="mt-2 pt-2 border-t border-white/10 space-y-1">
          {conns.map(c => {
            const o = nodeMap.get(c.from === node.id ? c.to : c.from)
            return o && <div key={o.id} className="flex items-center gap-1.5 text-xs">
              <span className={`w-1.5 h-1.5 ${o.branch === 'bridge' ? 'rotate-45' : 'rounded-full'}`}
                style={{ background: def.branches[o.branch]?.color }} />
              <span className="text-gray-300">{o.title}</span>
            </div>
          })}
        </div>
      )}
      {items.length > 0 && (
        <div className="mt-2 pt-2 border-t border-white/10 space-y-1.5">
          {items.map((item, i) => {
            const cost = item.cost ?? 0
            const isRevealed = cost === 0 || revealed[`${node.id}:${i}`]
            return (
              <div key={i} className="text-xs">
                <span className="text-[9px] uppercase tracking-wider text-white/20">{item.type}</span>
                {isRevealed ? (
                  <>
                    <p className="text-gray-300">{item.text}</p>
                    {item.answer && <p className="text-gray-500 text-[11px] mt-0.5">→ {item.answer}</p>}
                  </>
                ) : (
                  <button onClick={() => handleReveal(node.id, i)}
                    className="w-full text-left py-1 px-1.5 rounded bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 transition-colors"
                    disabled={coins < cost}>
                    <span className="blur-sm select-none">{item.text.slice(0, 20)}...</span>
                    <span className="ml-2 text-[10px]">{cost} monet</span>
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
