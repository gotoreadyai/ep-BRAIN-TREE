// Moduł uczenia — Zustand slice
// Warstwa 3: progres, monety, odkrycia (spaced repetition)

import type { TreeNode, TreeEdge, ContentItem, NodeStatus, DiscoveryEdge } from './types'
import { discGetAll, discSave, discClear } from './cache'

// Siła krawędzi odkrycia — zanikanie wykładnicze z czasem
export const edgeStr = (e: DiscoveryEdge) =>
  Math.min(e.hits / 5, 1) * Math.exp(-0.1 * (Date.now() - e.lastSeen) / 864e5)

function buildDiscoveryMap(edges: DiscoveryEdge[]): Record<string, number> {
  const m: Record<string, number> = {}
  for (const e of edges) {
    const s = edgeStr(e)
    if (!m[e.nodeId] || s > m[e.nodeId]) m[e.nodeId] = s
  }
  return m
}

function initStates(nodes: { id: string; tier: number; branch: string }[], backbone: string) {
  const s: Record<string, NodeStatus> = {}
  for (const n of nodes) s[n.id] = (n.tier === 0 && n.branch === backbone) ? 'available' : 'locked'
  return s
}

// Odblokuj sąsiadów: 1 per branch, progression + bridge zawsze
export function unlock(id: string, states: Record<string, NodeStatus>, edges: TreeEdge[],
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

// --- Persistence keys ---
const PK = (id: string) => `progress:${id}`
const CK = (id: string) => `coins:${id}`
const RK = (id: string) => `revealed:${id}`

// --- State & Actions ---

export interface LearningState {
  nodeStates: Record<string, NodeStatus>
  coins: number
  revealed: Record<string, boolean>
  discoveryEdges: DiscoveryEdge[]
  discoveryMap: Record<string, number>
}

export interface LearningActions {
  progressNode: (id: string) => void
  revealItem: (contentId: string) => void
  recordDiscovery: (nodeId: string, contentId: string) => Promise<void>
  resetProgress: () => void
}

// Inicjalizacja stanu uczenia z localStorage (sync)
export function initLearningState(nodes: TreeNode[], backbone: string, treeId: string): LearningState {
  const saved = localStorage.getItem(PK(treeId))
  let nodeStates: Record<string, NodeStatus>
  try { nodeStates = saved ? JSON.parse(saved) : initStates(nodes, backbone) }
  catch { nodeStates = initStates(nodes, backbone) }
  const coins = Number(localStorage.getItem(CK(treeId))) || 0
  const savedR = localStorage.getItem(RK(treeId))
  let revealed: Record<string, boolean> = {}
  try { revealed = savedR ? JSON.parse(savedR) : {} } catch { revealed = {} }
  return { nodeStates, coins, revealed, discoveryEdges: [], discoveryMap: {} }
}

// Async: doładuj odkrycia z IDB (wywoływane po load)
export function loadDiscovery(treeId: string, set: (s: Partial<LearningState>) => void) {
  discGetAll(treeId).then(edges => {
    set({ discoveryEdges: edges, discoveryMap: buildDiscoveryMap(edges) })
  })
}

// Zustand slice — wymaga get() zwracającego pełny store (def, edges, nodeMap, content)
export function createLearningSlice(set: any, get: any): LearningState & LearningActions {
  return {
    nodeStates: {}, coins: 0, revealed: {},
    discoveryEdges: [], discoveryMap: {},

    progressNode: (id) => set((s: any) => {
      if (!s.def) return s
      const st = s.nodeStates[id]
      if (st === 'locked' || st === 'mastered') return s
      const nodeStates = { ...s.nodeStates }
      const reward = st === 'available' ? 1 : 3
      if (st === 'available') { nodeStates[id] = 'in_progress'; unlock(id, nodeStates, s.edges, s.nodeMap) }
      else { nodeStates[id] = 'mastered'; unlock(id, nodeStates, s.edges, s.nodeMap) }
      const coins = s.coins + reward
      localStorage.setItem(PK(s.def.id), JSON.stringify(nodeStates))
      localStorage.setItem(CK(s.def.id), String(coins))
      return { nodeStates, coins }
    }),

    revealItem: (contentId) => set((s: any) => {
      if (!s.def) return s
      if (s.revealed[contentId]) return s
      // Znajdź item po contentId
      let cost = 0
      for (const items of Object.values(s.content) as any[][]) {
        const found = items.find((it: any) => it.id === contentId)
        if (found) { cost = found.cost ?? 0; break }
      }
      if (cost > 0 && s.coins < cost) return s
      const coins = s.coins - cost
      const revealed = { ...s.revealed, [contentId]: true }
      localStorage.setItem(CK(s.def.id), String(coins))
      localStorage.setItem(RK(s.def.id), JSON.stringify(revealed))
      return { coins, revealed }
    }),

    recordDiscovery: async (nodeId, contentId) => {
      const s = get()
      if (!s.def) return
      const now = Date.now()
      const existing = s.discoveryEdges.find((e: DiscoveryEdge) => e.id === contentId)
      const edge: DiscoveryEdge = existing
        ? { ...existing, hits: existing.hits + 1, lastSeen: now }
        : { id: contentId, treeId: s.def.id, nodeId, hits: 1, firstSeen: now, lastSeen: now }
      await discSave(edge)
      const edges = existing
        ? s.discoveryEdges.map((e: DiscoveryEdge) => e.id === contentId ? edge : e)
        : [...s.discoveryEdges, edge]
      set({ discoveryEdges: edges, discoveryMap: buildDiscoveryMap(edges) })
    },

    resetProgress: () => set((s: any) => {
      if (!s.def) return s
      const backbone = Object.keys(s.def.branches).filter((b: string) => b !== 'bridge')[0]
      const nodeStates = initStates(s.def.nodes, backbone)
      localStorage.setItem(PK(s.def.id), JSON.stringify(nodeStates))
      localStorage.setItem(CK(s.def.id), '0')
      localStorage.removeItem(RK(s.def.id))
      discClear(s.def.id)
      return { nodeStates, coins: 0, revealed: {}, discoveryEdges: [], discoveryMap: {} }
    }),
  }
}
