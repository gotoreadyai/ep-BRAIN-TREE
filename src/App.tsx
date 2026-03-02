import { useEffect, useState } from 'react'
import { useTreeStore } from './store'
import TreeScene from './TreeScene'
import { MousePointer2, Move, ZoomIn } from 'lucide-react'

// Dane — na razie statyczny import, docelowo z API/pliku
import polskiMatura from './skill-tree-data'

export default function App() {
  const { def, nodes, edges, load, selectedNodeId } = useTreeStore()
  const [showHint, setShowHint] = useState(true)

  useEffect(() => { load(polskiMatura) }, [load])
  useEffect(() => { if (selectedNodeId && showHint) setShowHint(false) }, [selectedNodeId, showHint])

  const selectedNode = nodes.find(n => n.id === selectedNodeId)
  const connections = selectedNode
    ? edges.filter(e => e.from === selectedNode.id || e.to === selectedNode.id)
    : []

  if (!def) return null

  return (
    <div className="h-screen w-screen relative select-none">
      <TreeScene />

      {/* Tytuł */}
      <div className="absolute top-4 left-4 pointer-events-none">
        <h1 className="text-white text-lg font-bold">{def.title}</h1>
        <p className="text-gray-500 text-xs">{nodes.length} węzłów · {edges.length} połączeń</p>
      </div>

      {/* Hint nawigacji */}
      {showHint && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
          <div className="bg-black/70 backdrop-blur rounded-xl px-6 py-4 text-white text-center space-y-3">
            <p className="text-sm font-medium mb-3">Eksploruj drzewo umiejętności</p>
            <div className="flex items-center gap-6 text-xs text-gray-300">
              <span className="flex items-center gap-1.5"><MousePointer2 className="w-4 h-4" /> Kliknij węzeł</span>
              <span className="flex items-center gap-1.5"><Move className="w-4 h-4" /> Przeciągnij</span>
              <span className="flex items-center gap-1.5"><ZoomIn className="w-4 h-4" /> Scroll = zoom</span>
            </div>
          </div>
        </div>
      )}

      {/* Legenda gałęzi */}
      <div className="absolute bottom-4 left-4 flex flex-wrap gap-1.5 pointer-events-none">
        {Object.entries(def.branches).map(([branch, { color, label }]) => {
          const count = nodes.filter(n => n.branch === branch).length
          if (!count) return null
          return (
            <span key={branch} className="text-[10px] px-2 py-0.5 rounded-full bg-black/60 text-white flex items-center gap-1">
              <span className={`w-2 h-2 ${branch === 'bridge' ? 'rotate-45' : 'rounded-full'}`}
                style={{ background: color }} />
              {label}
            </span>
          )
        })}
      </div>

      {/* Panel wybranego węzła */}
      {selectedNode && (
        <div className="absolute top-4 right-4 w-64 bg-black/80 backdrop-blur-sm rounded-lg p-3 text-white">
          <div className="flex items-center gap-2 mb-1">
            <span className={`w-2.5 h-2.5 ${selectedNode.branch === 'bridge' ? 'rotate-45' : 'rounded-full'}`}
              style={{ background: def.branches[selectedNode.branch]?.color }} />
            <span className="text-[10px] text-gray-400 uppercase tracking-wide">
              {def.branches[selectedNode.branch]?.label}
            </span>
          </div>
          <h3 className="font-bold leading-tight">{selectedNode.title}</h3>
          {selectedNode.branch === 'bridge' && selectedNode.bridgeTo && (
            <p className="text-sm mt-1" style={{ color: def.branches.bridge?.color }}>→ {selectedNode.bridgeTo}</p>
          )}
          {selectedNode.description && (
            <p className="text-gray-400 text-xs mt-1">{selectedNode.description}</p>
          )}
          {selectedNode.terms && selectedNode.terms.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {selectedNode.terms.map(t => (
                <span key={t} className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-gray-300">{t}</span>
              ))}
            </div>
          )}
          {connections.length > 0 && (
            <div className="mt-2 pt-2 border-t border-white/10 space-y-1">
              {connections.map(c => {
                const otherId = c.from === selectedNode.id ? c.to : c.from
                const other = nodes.find(n => n.id === otherId)
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
        </div>
      )}
    </div>
  )
}
