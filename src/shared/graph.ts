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

/* Galaxy 3D layout — obliczany RAZ przy load, stabilny */

export interface GalaxyNode extends TreeNode {
  gx: number; gy: number; gz: number
}

export function buildGalaxyLayout(def: SkillTreeDef): GalaxyNode[] {
  /* Adjacency */
  const adj = new Map<string, string[]>()
  for (const e of def.edges) {
    if (!adj.has(e.from)) adj.set(e.from, [])
    if (!adj.has(e.to)) adj.set(e.to, [])
    adj.get(e.from)!.push(e.to)
    adj.get(e.to)!.push(e.from)
  }
  const pos = new Map<string, [number, number, number]>()

  /* Słońca na spirali */
  const backbone = Object.keys(def.branches).filter(b => b !== 'bridge')[0]
  if (!backbone) return def.nodes.map(n => ({ ...n, gx: 0, gy: 0, gz: 0 }))
  const suns = def.nodes.filter(n => n.branch === backbone).sort((a, b) => a.tier - b.tier)
  if (!suns.length) return def.nodes.map(n => ({ ...n, gx: 0, gy: 0, gz: 0 }))
  const sunSet = new Set(suns.map(n => n.id))
  suns.forEach((n, i) => {
    const a = i * 0.7, r = 10 + i * 3.5
    pos.set(n.id, [Math.cos(a) * r, Math.sin(a * 0.5) * 4, Math.sin(a) * r])
  })

  /* Klasyfikuj: ile słońc łączy każdy węzeł (1-2 hopy) */
  const nodeSuns = new Map<string, string[]>()
  for (const n of def.nodes) {
    if (sunSet.has(n.id)) continue
    const connected: string[] = []
    for (const nb of adj.get(n.id) ?? [])
      if (sunSet.has(nb)) connected.push(nb)
    if (!connected.length)
      for (const nb of adj.get(n.id) ?? [])
        for (const nb2 of adj.get(nb) ?? [])
          if (sunSet.has(nb2) && !connected.includes(nb2)) connected.push(nb2)
    nodeSuns.set(n.id, connected.length ? connected : [suns[0].id])
  }

  /* Orbity per branch — abstrakcyjne bliżej słońca, konkretne dalej */
  const orbitBranches = Object.keys(def.branches).filter(b => b !== backbone && b !== 'bridge')
  const branchOrbit = new Map<string, number>()
  orbitBranches.forEach((b, i) => branchOrbit.set(b, orbitBranches.length - 1 - i))

  /* Planety (1 słońce, nie-bridge) vs asteroidy (2+ słońc LUB bridge) */
  const systems = new Map<string, TreeNode[]>()
  const asteroids: TreeNode[] = []
  for (const n of def.nodes) {
    if (sunSet.has(n.id)) continue
    if (n.branch === 'bridge') { asteroids.push(n); continue }
    const sn = nodeSuns.get(n.id)!
    if (sn.length === 1) {
      if (!systems.has(sn[0])) systems.set(sn[0], [])
      systems.get(sn[0])!.push(n)
    } else {
      asteroids.push(n)
    }
  }

  /* Pozycjonuj planety — wewnętrzne orbity first, kąt ku sąsiadom */
  for (const [sid, planets] of systems) {
    const [sx, sy, sz] = pos.get(sid)!
    const byOrbit = new Map<number, TreeNode[]>()
    for (const p of planets) {
      const oi = branchOrbit.get(p.branch) ?? 0
      if (!byOrbit.has(oi)) byOrbit.set(oi, [])
      byOrbit.get(oi)!.push(p)
    }
    for (const [oi, ring] of [...byOrbit].sort((a, b) => a[0] - b[0])) {
      const r = 3 + oi * 2.5
      const items = ring.map((p, i) => {
        const nbs = (adj.get(p.id) ?? []).filter(nb => pos.has(nb) && nb !== sid)
        if (nbs.length) {
          let tx = 0, tz = 0
          for (const nb of nbs) { const [nx,, nz] = pos.get(nb)!; tx += nx - sx; tz += nz - sz }
          return { p, angle: Math.atan2(tz, tx) }
        }
        return { p, angle: (i / ring.length) * Math.PI * 2 + oi * 0.8 }
      })
      items.sort((a, b) => a.angle - b.angle)
      const gap = Math.min(0.5, (Math.PI * 2) / Math.max(items.length, 1))
      for (let i = 1; i < items.length; i++)
        if (items[i].angle - items[i - 1].angle < gap) items[i].angle = items[i - 1].angle + gap
      for (const { p, angle } of items)
        pos.set(p.id, [sx + Math.cos(angle) * r, sy + Math.sin(angle + oi * 1.2) * (1 + oi * 0.6), sz + Math.sin(angle) * r])
    }
  }

  /* Asteroidy (bridge + wielosystemowe) — midpoint pozycjonowanych sąsiadów */
  asteroids.forEach((p, i) => {
    const nbs = (adj.get(p.id) ?? []).filter(nb => pos.has(nb))
    if (!nbs.length) { pos.set(p.id, [0, -10, 0]); return }
    let mx = 0, my = 0, mz = 0
    for (const nb of nbs) { const [x, y, z] = pos.get(nb)!; mx += x; my += y; mz += z }
    mx /= nbs.length; my /= nbs.length; mz /= nbs.length
    pos.set(p.id, [mx, my - 1.5, mz + i * 0.8])
  })

  return def.nodes.map(n => {
    const [gx, gy, gz] = pos.get(n.id) ?? [0, 0, 0]
    return { ...n, gx, gy, gz }
  })
}
