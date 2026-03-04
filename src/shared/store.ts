// Store — graf wiedzy + content + kompozycja z modułem uczenia

import { create } from 'zustand'
import type { SkillTreeDef, TreeNode, TreeEdge, TreePack, ContentPack, ContentItem, PackEntry } from './types'
import { buildGalaxyLayout, type GalaxyNode } from './graph'
import { createLearningSlice, initLearningState, loadDiscovery, unlock,
  type LearningState, type LearningActions } from './learning'

// Zasięg widoczności — BFS z gradientem
const FADE = [1, 1, 0.6, 0.3]
function connected(id: string | null, edges: TreeEdge[]): Map<string, number> | null {
  if (!id) return null
  const m = new Map<string, number>([[id, 1]])
  const queue: [string, number][] = [[id, 0]]
  while (queue.length) {
    const [curr, d] = queue.shift()!
    if (d >= FADE.length - 1) continue
    for (const e of edges) {
      const o = e.from === curr ? e.to : e.to === curr ? e.from : null
      if (o && !m.has(o)) { m.set(o, FADE[d + 1]); queue.push([o, d + 1]) }
    }
  }
  return m
}

// Scal rozszerzenie z bazą (deduplikacja)
function merge(base: SkillTreeDef, ext: TreePack): SkillTreeDef {
  const nodeIds = new Set(base.nodes.map(n => n.id))
  const edgeKeys = new Set(base.edges.map(e => `${e.from}:${e.to}`))
  return {
    ...base,
    nodes: [...base.nodes, ...ext.nodes.filter(n => !nodeIds.has(n.id))],
    edges: [...base.edges, ...ext.edges.filter(e => !edgeKeys.has(`${e.from}:${e.to}`))],
  }
}

interface TreeState {
  def: SkillTreeDef | null
  nodes: TreeNode[]
  edges: TreeEdge[]
  nodeMap: Map<string, TreeNode>
  galaxyNodes: GalaxyNode[]
  backbone: string
  selectedNodeId: string | null
  connectedIds: Map<string, number> | null
  content: Record<string, ContentItem[]>
  extensions: PackEntry[]
  loadedExtensions: Set<string>
}

interface TreeActions {
  load: (def: SkillTreeDef) => void
  loadExtension: (pack: TreePack, repo: string) => void
  loadContent: (pack: ContentPack, repo?: string) => void
  setExtensions: (exts: PackEntry[]) => void
  setSelectedNode: (id: string | null) => void
}

type Store = TreeState & TreeActions & LearningState & LearningActions

export const useTreeStore = create<Store>((set, get) => ({
  // --- Warstwa uczenia (slice) ---
  ...createLearningSlice(set, get),

  // --- Graf wiedzy ---
  def: null, nodes: [], edges: [],
  nodeMap: new Map(), galaxyNodes: [], backbone: '',
  selectedNodeId: null, connectedIds: null,
  content: {},
  extensions: [], loadedExtensions: new Set(),

  load: (def) => {
    const nodeMap = new Map(def.nodes.map(n => [n.id, n]))
    const backbone = Object.keys(def.branches).filter(b => b !== 'bridge')[0]
    const learning = initLearningState(def.nodes, backbone, def.id)
    const galaxyNodes = buildGalaxyLayout(def)
    set({ def, nodes: def.nodes, edges: def.edges, nodeMap, galaxyNodes, backbone,
      ...learning, content: {}, selectedNodeId: null, connectedIds: null })
    loadDiscovery(def.id, set)
  },

  loadExtension: (pack, repo) => set((s) => {
    if (!s.def) return s
    const merged = merge(s.def, pack)
    const nodeMap = new Map(merged.nodes.map(n => [n.id, n]))
    const loadedExtensions = new Set(s.loadedExtensions)
    loadedExtensions.add(repo)
    const nodeStates = { ...s.nodeStates }
    for (const n of pack.nodes) if (!(n.id in nodeStates)) nodeStates[n.id] = 'locked'
    for (const id of Object.keys(nodeStates)) {
      if (nodeStates[id] === 'mastered' || nodeStates[id] === 'in_progress')
        unlock(id, nodeStates, merged.edges, nodeMap)
    }
    localStorage.setItem(`progress:${merged.id}`, JSON.stringify(nodeStates))
    const galaxyNodes = buildGalaxyLayout(merged)
    return { def: merged, nodes: merged.nodes, edges: merged.edges, nodeMap, galaxyNodes,
      nodeStates, loadedExtensions, selectedNodeId: null, connectedIds: null }
  }),

  loadContent: (pack, repo?) => set((s) => {
    const content = { ...s.content }
    for (const [nodeId, items] of Object.entries(pack.content))
      content[nodeId] = [...(content[nodeId] ?? []),
        ...items.map((item, i) => ({ ...item, id: item.id ?? `${pack.id}::${nodeId}::${i}` }))]
    if (!repo) return { content }
    const loadedExtensions = new Set(s.loadedExtensions)
    loadedExtensions.add(repo)
    return { content, loadedExtensions }
  }),

  setExtensions: (exts) => set({ extensions: exts }),

  setSelectedNode: (id) => set((s) => {
    const sel = s.selectedNodeId === id ? null : id
    return { selectedNodeId: sel, connectedIds: connected(sel, s.edges) }
  }),
}))
