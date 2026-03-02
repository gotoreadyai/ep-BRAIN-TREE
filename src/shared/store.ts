import { create } from 'zustand'
import type { SkillTreeDef, TreeEdge, TreePack, ContentPack, ContentItem, NodeStatus, PackEntry } from './types'
import { buildLayout, type PosNode, type ColumnHeader } from './graph'

// Zasięg widoczności — BFS z gradientem (0=selected, 1=sąsiad, 2=60%, 3=30%)
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

// Początkowy stan: tylko backbone tier 0 = available, reszta locked
function initStates(nodes: { id: string; tier: number; branch: string }[], backbone: string) {
  const s: Record<string, NodeStatus> = {}
  for (const n of nodes) s[n.id] = (n.tier === 0 && n.branch === backbone) ? 'available' : 'locked'
  return s
}

// Odblokuj max 3 sąsiadów: progression > branch. Bridge bez limitu.
function unlock(id: string, states: Record<string, NodeStatus>, edges: TreeEdge[]) {
  const candidates: { id: string; prio: number }[] = []
  for (const e of edges) {
    const o = e.from === id ? e.to : e.to === id ? e.from : null
    if (!o || states[o] !== 'locked') continue
    if (e.type === 'bridge') { states[o] = 'available'; continue }
    candidates.push({ id: o, prio: e.type === 'progression' ? 0 : 1 })
  }
  candidates.sort((a, b) => a.prio - b.prio)
  for (const c of candidates.slice(0, 3)) states[c.id] = 'available'
}

const PK = (id: string) => `progress:${id}`

// Scal rozszerzenie z bazą
function merge(base: SkillTreeDef, ext: TreePack): SkillTreeDef {
  const ids = new Set(base.nodes.map(n => n.id))
  return {
    ...base,
    nodes: [...base.nodes, ...ext.nodes.filter(n => !ids.has(n.id))],
    edges: [...base.edges, ...ext.edges],
  }
}

interface TreeStore {
  def: SkillTreeDef | null
  nodes: PosNode[]
  edges: TreeEdge[]
  columns: ColumnHeader[]
  nodeMap: Map<string, PosNode>
  backbone: string
  selectedNodeId: string | null
  connectedIds: Map<string, number> | null
  nodeStates: Record<string, NodeStatus>
  content: Record<string, ContentItem[]>
  extensions: PackEntry[]
  loadedExtensions: Set<string>
  load: (def: SkillTreeDef) => void
  loadExtension: (pack: TreePack, repo: string) => void
  loadContent: (pack: ContentPack) => void
  progressNode: (id: string) => void
  resetProgress: () => void
  setExtensions: (exts: PackEntry[]) => void
  setSelectedNode: (id: string | null) => void
}

export const useTreeStore = create<TreeStore>((set) => ({
  def: null, nodes: [], edges: [], columns: [],
  nodeMap: new Map(), backbone: '',
  selectedNodeId: null, connectedIds: null,
  nodeStates: {}, content: {},
  extensions: [], loadedExtensions: new Set(),

  load: (def) => {
    const { nodes, edges, columns } = buildLayout(def)
    const nodeMap = new Map(nodes.map(n => [n.id, n]))
    const backbone = Object.keys(def.branches).filter(b => b !== 'bridge')[0]
    const saved = localStorage.getItem(PK(def.id))
    let nodeStates: Record<string, NodeStatus>
    try { nodeStates = saved ? JSON.parse(saved) : initStates(def.nodes, backbone) }
    catch { nodeStates = initStates(def.nodes, backbone) }
    set({ def, nodes, edges, columns, nodeMap, backbone, nodeStates, content: {},
      selectedNodeId: null, connectedIds: null })
  },

  loadExtension: (pack, repo) => set((s) => {
    if (!s.def) return s
    const merged = merge(s.def, pack)
    const { nodes, edges, columns } = buildLayout(merged)
    const nodeMap = new Map(nodes.map(n => [n.id, n]))
    const loadedExtensions = new Set(s.loadedExtensions)
    loadedExtensions.add(repo)
    // Zachowaj postęp, nowe węzły = locked, odblokuj przy opanowanych sąsiadach
    const nodeStates = { ...s.nodeStates }
    for (const n of pack.nodes) if (!(n.id in nodeStates)) nodeStates[n.id] = 'locked'
    for (const e of pack.edges) {
      if (nodeStates[e.from] === 'mastered' && nodeStates[e.to] === 'locked') nodeStates[e.to] = 'available'
      if (nodeStates[e.to] === 'mastered' && nodeStates[e.from] === 'locked') nodeStates[e.from] = 'available'
    }
    localStorage.setItem(PK(merged.id), JSON.stringify(nodeStates))
    return { def: merged, nodes, edges, columns, nodeMap, nodeStates,
      content: s.content, loadedExtensions,
      selectedNodeId: null, connectedIds: null }
  }),

  loadContent: (pack) => set((s) => {
    const content = { ...s.content }
    for (const [nodeId, items] of Object.entries(pack.content))
      content[nodeId] = [...(content[nodeId] ?? []), ...items]
    return { content }
  }),

  progressNode: (id) => set((s) => {
    if (!s.def) return s
    const st = s.nodeStates[id]
    if (st === 'locked' || st === 'mastered') return s
    const nodeStates = { ...s.nodeStates }
    if (st === 'available') nodeStates[id] = 'in_progress'
    else { nodeStates[id] = 'mastered'; unlock(id, nodeStates, s.edges) }
    localStorage.setItem(PK(s.def.id), JSON.stringify(nodeStates))
    return { nodeStates }
  }),

  resetProgress: () => set((s) => {
    if (!s.def) return s
    const nodeStates = initStates(s.def.nodes, s.backbone)
    localStorage.setItem(PK(s.def.id), JSON.stringify(nodeStates))
    return { nodeStates }
  }),

  setExtensions: (exts) => set({ extensions: exts }),

  setSelectedNode: (id) => set((s) => {
    const sel = s.selectedNodeId === id ? null : id
    return { selectedNodeId: sel, connectedIds: connected(sel, s.edges) }
  }),
}))
