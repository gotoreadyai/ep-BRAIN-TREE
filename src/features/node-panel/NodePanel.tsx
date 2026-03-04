import { useTreeStore } from '../../shared/store'

export default function NodePanel() {
  const { def, nodeMap, edges, selectedNodeId, content, setSelectedNode } = useTreeStore()
  const node = selectedNodeId ? nodeMap.get(selectedNodeId) : undefined
  if (!def || !node) return null

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

      {node.branch === 'bridge' && node.bridgeTo && (
        <p className="text-sm mt-1" style={{ color: def.branches.bridge?.color }}>→ {node.bridgeTo}</p>
      )}
      {node.description && <p className="text-gray-400 text-xs mt-1">{node.description}</p>}

      {conns.length > 0 && (
        <div className="mt-2 pt-2 border-t border-white/10 space-y-1">
          {conns.map(c => {
            const o = nodeMap.get(c.from === node.id ? c.to : c.from)
            return o && (
              <button key={o.id} onClick={() => setSelectedNode(o.id)}
                className="w-full text-left flex items-center gap-1.5 text-xs py-0.5 rounded hover:bg-white/5">
                <span className={`w-1.5 h-1.5 ${o.branch === 'bridge' ? 'rotate-45' : 'rounded-full'}`}
                  style={{ background: def.branches[o.branch]?.color }} />
                <span className="text-gray-300">{o.title}</span>
              </button>
            )
          })}
        </div>
      )}

      {items.length > 0 && (
        <div className="mt-2 pt-2 border-t border-white/10 space-y-1.5">
          {items.map(item => (
            <div key={item.id} className="text-xs">
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
