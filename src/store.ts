import { create } from 'zustand'
import type { SkillTreeDef, TreeEdge } from './types'
import { buildLayout, type PosNode, type ColumnHeader } from './graph'

interface TreeStore {
  def: SkillTreeDef | null
  nodes: PosNode[]
  edges: TreeEdge[]
  columns: ColumnHeader[]
  hoveredNodeId: string | null
  selectedNodeId: string | null
  load: (def: SkillTreeDef) => void
  setHoveredNode: (id: string | null) => void
  setSelectedNode: (id: string | null) => void
}

export const useTreeStore = create<TreeStore>((set) => ({
  def: null,
  nodes: [],
  edges: [],
  columns: [],
  hoveredNodeId: null,
  selectedNodeId: null,

  load: (def) => {
    const { nodes, edges, columns } = buildLayout(def)
    set({ def, nodes, edges, columns, selectedNodeId: null, hoveredNodeId: null })
  },

  setHoveredNode: (id) => set({ hoveredNodeId: id }),
  setSelectedNode: (id) => set((s) => ({
    selectedNodeId: s.selectedNodeId === id ? null : id,
  })),
}))
