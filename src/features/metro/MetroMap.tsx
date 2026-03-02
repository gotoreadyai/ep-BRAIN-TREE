import { useMemo } from 'react'
import { useTreeStore } from '../../shared/store'
import type { PosNode } from '../../shared/graph'

const SCALE = 24
const TIER_GAP = 52

interface SvgNode extends PosNode { sx: number; sy: number }

export default function MetroMap() {
  const { def, nodes, edges, columns, selectedNodeId, connectedIds, backbone,
    setSelectedNode, nodeStates } = useTreeStore()

  const { svgNodes, svgMap, vb, bridgeBase } = useMemo(() => {
    if (!nodes.length) return { svgNodes: [] as SvgNode[], svgMap: new Map<string, SvgNode>(), vb: '0 0 100 100', bridgeBase: 0 }
    const maxTier = Math.max(...nodes.filter(n => n.branch !== 'bridge').map(n => n.tier), 0)
    const bBase = (maxTier + 2) * TIER_GAP
    const sn: SvgNode[] = nodes.map(n => ({
      ...n,
      sx: n.x * SCALE,
      sy: n.branch === 'bridge' ? bBase + n.tier * TIER_GAP * 0.7 : n.tier * TIER_GAP,
    }))
    const sm = new Map<string, SvgNode>()
    for (const n of sn) sm.set(n.id, n)
    const xs = sn.map(n => n.sx), ys = sn.map(n => n.sy)
    return { svgNodes: sn, svgMap: sm, bridgeBase: bBase,
      vb: `${Math.min(...xs) - 40} ${Math.min(...ys) - 55} ${Math.max(...xs) - Math.min(...xs) + 220} ${Math.max(...ys) - Math.min(...ys) + 95}` }
  }, [nodes])

  if (!def) return null

  const prox = (id: string) => connectedIds ? (connectedIds.get(id) ?? 0.08) : 1
  const st = (id: string) => nodeStates[id] ?? 'locked'

  return (
    <div className="h-full w-full overflow-auto">
      <svg viewBox={vb} preserveAspectRatio="xMidYMin meet"
        className="w-full" style={{ minHeight: '100vh' }}>

        {/* Pionowe prowadnice kolumn */}
        {columns.map(col => {
          const cn = svgNodes.filter(n => n.branch === col.branch)
          if (cn.length < 2) return null
          const ax = cn.reduce((s, n) => s + n.sx, 0) / cn.length
          return (
            <line key={`g-${col.branch}`}
              x1={ax} y1={Math.min(...cn.map(n => n.sy)) - 12}
              x2={ax} y2={Math.max(...cn.map(n => n.sy)) + 12}
              stroke={col.color} strokeOpacity={0.06} strokeWidth={1} />
          )
        })}

        {/* Krawędzie */}
        {edges.map((e, i) => {
          const a = svgMap.get(e.from), b = svgMap.get(e.to)
          if (!a || !b) return null
          const ep = Math.max(prox(e.from), prox(e.to))
          const bridge = e.type === 'bridge'
          const aLocked = st(e.from) === 'locked', bLocked = st(e.to) === 'locked'
          const stateMul = (aLocked && bLocked) ? 0.05 : (aLocked || bLocked) ? 0.3 : 1
          const color = bridge ? (def.branches.bridge?.color ?? '#fbbf24')
            : e.type === 'progression' ? '#ffffff'
            : def.branches[a.branch]?.color ?? '#666'
          const baseOp = e.type === 'progression' ? 0.3 : bridge ? 0.2 : 0.1
          return (
            <line key={i} x1={a.sx} y1={a.sy} x2={b.sx} y2={b.sy}
              stroke={color}
              strokeWidth={e.type === 'progression' ? 2.5 : 1}
              strokeOpacity={baseOp * stateMul * ep}
              strokeDasharray={bridge ? '4 3' : undefined}
              strokeLinecap="round" />
          )
        })}

        {/* Węzły */}
        {svgNodes.map(node => {
          const state = st(node.id)
          const np = prox(node.id)
          const color = def.branches[node.branch]?.color ?? '#666'
          const isBack = node.branch === backbone
          const isBridge = node.branch === 'bridge'
          const r = isBack ? 5 : 3.5
          const sel = selectedNodeId === node.id
          const ringOp = (state === 'locked' ? 0.1 : state === 'available' ? 0.25 : state === 'in_progress' ? 0.4 : 0.6) * np
          const filled = state === 'mastered' || state === 'in_progress'

          return (
            <g key={node.id}>
              {state === 'in_progress' && np > 0.5 && (
                <circle cx={node.sx} cy={node.sy} r={r + 4}
                  fill="none" stroke={color} strokeWidth={1} className="metro-progress" />
              )}
              {sel && (
                <circle cx={node.sx} cy={node.sy} r={r + 8} fill={color} fillOpacity={0.08} />
              )}

              {/* Outline — zawsze widoczny */}
              {isBridge ? (
                <rect x={node.sx - r * 0.7} y={node.sy - r * 0.7} width={r * 1.4} height={r * 1.4}
                  fill={filled ? color : 'none'} fillOpacity={filled ? ringOp : 0}
                  stroke={color} strokeWidth={1} opacity={ringOp}
                  transform={`rotate(45 ${node.sx} ${node.sy})`} />
              ) : (
                <>
                  <circle cx={node.sx} cy={node.sy} r={r}
                    fill="none" stroke={color} strokeWidth={1} opacity={ringOp} />
                  {filled && <circle cx={node.sx} cy={node.sy} r={r} fill={color} opacity={ringOp} />}
                </>
              )}

              <circle cx={node.sx} cy={node.sy} r={14}
                fill="transparent" className="cursor-pointer"
                onClick={() => setSelectedNode(node.id)} />

              {(isBack || state !== 'locked') && (
                <text x={node.sx + r + 7} y={node.sy + 3.5}
                  fill="#ccc"
                  fontSize={isBack ? 11 : 9}
                  fontWeight={isBack ? 700 : 400}
                  className="pointer-events-none select-none"
                  opacity={(state === 'locked' ? 0.25 : state === 'available' ? 0.5 : 0.85) * np}>
                  {node.title}
                  {isBridge && node.bridgeTo && (
                    <tspan fill={color} opacity={0.7}>{` → ${node.bridgeTo}`}</tspan>
                  )}
                </text>
              )}
            </g>
          )
        })}

        {/* Separator strefy mostów */}
        {bridgeBase > 0 && svgNodes.some(n => n.branch === 'bridge') && (() => {
          const bc = def.branches.bridge?.color ?? '#fbbf24', sy = bridgeBase - TIER_GAP / 2
          return <>
            <line x1={-200} y1={sy} x2={200} y2={sy}
              stroke={bc} strokeOpacity={0.12} strokeWidth={0.5} strokeDasharray="6 4" />
            <text x={0} y={sy - 6} fill={bc} fontSize={8} textAnchor="middle" opacity={0.3}
              className="pointer-events-none select-none uppercase">Mosty</text>
          </>
        })()}

        {/* Nagłówki kolumn */}
        {columns.map(col => {
          const cn = svgNodes.filter(n => n.branch === col.branch)
          if (!cn.length) return null
          const ax = cn.reduce((s, n) => s + n.sx, 0) / cn.length
          return (
            <text key={`h-${col.branch}`} x={ax} y={-30}
              fill={col.color} fontSize={10} fontWeight={700}
              textAnchor="middle" letterSpacing="0.06em"
              className="pointer-events-none select-none uppercase"
              opacity={0.5}>
              {col.label}
            </text>
          )
        })}
      </svg>
    </div>
  )
}
