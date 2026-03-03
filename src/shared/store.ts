import { create } from 'zustand'
import type { SkillTreeDef, TreeNode, TreeEdge, TreePack, ContentPack, ContentItem, NodeStatus, PackEntry } from './types'
import { buildGalaxyLayout, type GalaxyNode } from './graph'

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

// Odblokuj 1 per branch: gatunki/motywy → lektury → warsztat. Progression + bridge osobno.
function unlock(id: string, states: Record<string, NodeStatus>, edges: TreeEdge[],
  nodeMap: Map<string, TreeNode>) {
  const unlocked = new Set<string>()
  for (const e of edges) {
    const o = e.from === id ? e.to : e.to === id ? e.from : null
    if (!o || states[o] !== 'locked') continue
    if (e.type === 'progression' || e.type === 'bridge') { states[o] = 'available'; continue }
    const branch = nodeMap.get(o)?.branch
    if (branch && !unlocked.has(branch)) { states[o] = 'available'; unlocked.add(branch) }
  }
}

const PK = (id: string) => `progress:${id}`

// Scal rozszerzenie z bazą (deduplikacja nodes + edges)
function merge(base: SkillTreeDef, ext: TreePack): SkillTreeDef {
  const nodeIds = new Set(base.nodes.map(n => n.id))
  const edgeKeys = new Set(base.edges.map(e => `${e.from}:${e.to}`))
  return {
    ...base,
    nodes: [...base.nodes, ...ext.nodes.filter(n => !nodeIds.has(n.id))],
    edges: [...base.edges, ...ext.edges.filter(e => !edgeKeys.has(`${e.from}:${e.to}`))],
  }
}

interface TreeStore {
  def: SkillTreeDef | null
  nodes: TreeNode[]
  edges: TreeEdge[]
  nodeMap: Map<string, TreeNode>
  galaxyNodes: GalaxyNode[]
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
  def: null, nodes: [], edges: [],
  nodeMap: new Map(), galaxyNodes: [], backbone: '',
  selectedNodeId: null, connectedIds: null,
  nodeStates: {}, content: {},
  extensions: [], loadedExtensions: new Set(),

  load: (def) => {
    const nodeMap = new Map(def.nodes.map(n => [n.id, n]))
    const backbone = Object.keys(def.branches).filter(b => b !== 'bridge')[0]
    const saved = localStorage.getItem(PK(def.id))
    let nodeStates: Record<string, NodeStatus>
    try { nodeStates = saved ? JSON.parse(saved) : initStates(def.nodes, backbone) }
    catch { nodeStates = initStates(def.nodes, backbone) }
    const galaxyNodes = buildGalaxyLayout(def)
    set({ def, nodes: def.nodes, edges: def.edges, nodeMap, galaxyNodes, backbone, nodeStates, content: {},
      selectedNodeId: null, connectedIds: null })
  },

  loadExtension: (pack, repo) => set((s) => {
    if (!s.def) return s
    const merged = merge(s.def, pack)
    const nodeMap = new Map(merged.nodes.map(n => [n.id, n]))
    const loadedExtensions = new Set(s.loadedExtensions)
    loadedExtensions.add(repo)
    // Zachowaj postęp, nowe węzły = locked, odblokuj przy opanowanych sąsiadach
    const nodeStates = { ...s.nodeStates }
    for (const n of pack.nodes) if (!(n.id in nodeStates)) nodeStates[n.id] = 'locked'
    for (const id of Object.keys(nodeStates)) {
      if (nodeStates[id] === 'mastered' || nodeStates[id] === 'in_progress')
        unlock(id, nodeStates, merged.edges, nodeMap)
    }
    localStorage.setItem(PK(merged.id), JSON.stringify(nodeStates))
    const galaxyNodes = buildGalaxyLayout(merged)
    return { def: merged, nodes: merged.nodes, edges: merged.edges, nodeMap, galaxyNodes, nodeStates,
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
    if (st === 'available') { nodeStates[id] = 'in_progress'; unlock(id, nodeStates, s.edges, s.nodeMap) }
    else { nodeStates[id] = 'mastered'; unlock(id, nodeStates, s.edges, s.nodeMap) }
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
