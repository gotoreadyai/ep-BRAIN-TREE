import { create } from 'zustand'
import type { SkillTreeDef, TreeEdge, NodeStatus } from './types'
import { buildLayout, type PosNode, type ColumnHeader } from './graph'

// Sąsiedzi węzła (do dimming)
function connected(id: string | null, edges: TreeEdge[]): Set<string> | null {
  if (!id) return null
  const s = new Set<string>([id])
  for (const e of edges) {
    if (e.from === id) s.add(e.to)
    if (e.to === id) s.add(e.from)
  }
  return s
}

// Demo: uczeń opanował materiał do tier 2 (Antyk–Renesans)
function demoStates(nodes: { id: string; tier: number }[]) {
  const s: Record<string, NodeStatus> = {}
  for (const n of nodes) {
    if (n.tier <= 2) s[n.id] = 'mastered'
    else if (n.tier === 3) s[n.id] = 'in_progress'
    else if (n.tier === 4) s[n.id] = 'available'
    else s[n.id] = 'locked'
  }
  return s
}

interface TreeStore {
  def: SkillTreeDef | null
  nodes: PosNode[]
  edges: TreeEdge[]
  columns: ColumnHeader[]
  nodeMap: Map<string, PosNode>
  backbone: string
  hoveredNodeId: string | null
  selectedNodeId: string | null
  connectedIds: Set<string> | null
  nodeStates: Record<string, NodeStatus>
  reviewDue: Set<string>
  load: (def: SkillTreeDef) => void
  setHoveredNode: (id: string | null) => void
  setSelectedNode: (id: string | null) => void
}

export const useTreeStore = create<TreeStore>((set) => ({
  def: null, nodes: [], edges: [], columns: [],
  nodeMap: new Map(), backbone: '',
  hoveredNodeId: null, selectedNodeId: null, connectedIds: null,
  nodeStates: {}, reviewDue: new Set(),

  load: (def) => {
    const { nodes, edges, columns } = buildLayout(def)
    const nodeMap = new Map(nodes.map(n => [n.id, n]))
    const backbone = Object.keys(def.branches).filter(b => b !== 'bridge')[0]
    const nodeStates = demoStates(def.nodes)
    const reviewDue = new Set(
      ['antygona', 'biblia', 'makbet', 'lament', 'm-bunt', 'g-tragedia']
        .filter(id => nodeStates[id] === 'mastered')
    )
    set({ def, nodes, edges, columns, nodeMap, backbone, nodeStates, reviewDue,
      selectedNodeId: null, hoveredNodeId: null, connectedIds: null })
  },

  setHoveredNode: (id) => set((s) => ({
    hoveredNodeId: id,
    connectedIds: connected(id ?? s.selectedNodeId, s.edges),
  })),
  setSelectedNode: (id) => set((s) => {
    const sel = s.selectedNodeId === id ? null : id
    return { selectedNodeId: sel, connectedIds: connected(s.hoveredNodeId ?? sel, s.edges) }
  }),
}))
