import type { SkillTreeDef, TreeNode, TreeEdge } from './types'

export interface PosNode extends TreeNode {
  x: number; y: number; z: number
}

export interface ColumnHeader {
  branch: string; x: number; label: string; color: string
}

const TIER_SPACING = 4

// Automatyczny layout — kolumny z kolejności branches w SkillTreeDef
export function buildLayout(def: SkillTreeDef): {
  nodes: PosNode[]; edges: TreeEdge[]; columns: ColumnHeader[]
} {
  // Zbuduj kolumny — bridge zawsze ostatnia
  const branchKeys = Object.keys(def.branches).filter(b => b !== 'bridge')
  if (def.branches.bridge) branchKeys.push('bridge')

  const totalWidth = (branchKeys.length - 1) * 7
  const columns: ColumnHeader[] = branchKeys.map((branch, i) => {
    // Pierwsza gałąź = centrum (x=0), reszta rozłożona symetrycznie
    const x = i === 0 ? 0 : -totalWidth / 2 + i * 7
    return { branch, x, label: def.branches[branch].label, color: def.branches[branch].color }
  })
  const colX = Object.fromEntries(columns.map(c => [c.branch, c.x]))

  // Policz sloty (branch + tier)
  const slotCount = new Map<string, number>()
  for (const n of def.nodes) {
    const key = `${n.branch}:${n.tier}`
    slotCount.set(key, (slotCount.get(key) ?? 0) + 1)
  }

  // Bridge zone — poniżej głównego drzewa, wycentrowane w X
  const maxTier = Math.max(...def.nodes.filter(n => n.branch !== 'bridge').map(n => n.tier), 0)
  const BRIDGE_GAP = 2

  const slotIndex = new Map<string, number>()
  const posNodes: PosNode[] = def.nodes.map(n => {
    const key = `${n.branch}:${n.tier}`
    const idx = slotIndex.get(key) ?? 0
    slotIndex.set(key, idx + 1)
    const total = slotCount.get(key)!
    const xOffset = (idx - (total - 1) / 2) * 2.8
    const isBridge = n.branch === 'bridge'

    return { ...n,
      x: isBridge ? xOffset : (colX[n.branch] ?? 0) + xOffset,
      y: isBridge ? -(maxTier + BRIDGE_GAP + n.tier) * TIER_SPACING : -n.tier * TIER_SPACING,
      z: 0 }
  })

  return { nodes: posNodes, edges: def.edges, columns }
}
