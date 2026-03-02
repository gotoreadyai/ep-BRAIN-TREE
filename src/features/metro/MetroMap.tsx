import { useMemo } from 'react'
import { useTreeStore } from '../../shared/store'
import type { PosNode } from '../../shared/graph'

const SCALE = 24
const TIER_GAP = 52

interface SvgNode extends PosNode { sx: number; sy: number }

export default function MetroMap() {
  const { def, nodes, edges, columns, hoveredNodeId, selectedNodeId, connectedIds, backbone,
    setHoveredNode, setSelectedNode, nodeStates, reviewDue } = useTreeStore()

  const { svgNodes, svgMap, vb } = useMemo(() => {
    if (!nodes.length) return { svgNodes: [] as SvgNode[], svgMap: new Map<string, SvgNode>(), vb: '0 0 100 100' }
    const sn: SvgNode[] = nodes.map(n => ({ ...n, sx: n.x * SCALE, sy: n.tier * TIER_GAP }))
    const sm = new Map<string, SvgNode>()
    for (const n of sn) sm.set(n.id, n)
    const xs = sn.map(n => n.sx), ys = sn.map(n => n.sy)
    return { svgNodes: sn, svgMap: sm,
      vb: `${Math.min(...xs) - 40} ${Math.min(...ys) - 55} ${Math.max(...xs) - Math.min(...xs) + 220} ${Math.max(...ys) - Math.min(...ys) + 95}` }
  }, [nodes])

  if (!def) return null

  const dim = (id: string) => !!connectedIds && !connectedIds.has(id)
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
          const d = dim(e.from) && dim(e.to)
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
              strokeOpacity={d ? 0.03 : baseOp * stateMul}
              strokeDasharray={bridge ? '4 3' : undefined}
              strokeLinecap="round" />
          )
        })}

        {/* Węzły */}
        {svgNodes.map(node => {
          const state = st(node.id)
          const dimmed = dim(node.id)
          const review = reviewDue.has(node.id)
          const color = def.branches[node.branch]?.color ?? '#666'
          const isBack = node.branch === backbone
          const isBridge = node.branch === 'bridge'
          const r = isBack ? 5 : 3.5
          const hov = hoveredNodeId === node.id
          const sel = selectedNodeId === node.id
          const op = dimmed ? 0.1 : state === 'locked' ? 0.15 : state === 'available' ? 0.45 : 1

          return (
            <g key={node.id}>
              {review && !dimmed && state === 'mastered' && (
                <circle cx={node.sx} cy={node.sy} r={r + 5}
                  fill="none" stroke={color} strokeWidth={1.5} className="metro-pulse" />
              )}
              {state === 'in_progress' && !dimmed && (
                <circle cx={node.sx} cy={node.sy} r={r + 4}
                  fill="none" stroke={color} strokeWidth={1} className="metro-progress" />
              )}
              {(hov || sel) && (
                <circle cx={node.sx} cy={node.sy} r={r + 8} fill={color} fillOpacity={0.08} />
              )}

              {/* Stacja */}
              {isBridge ? (
                <rect
                  x={node.sx - (state === 'locked' ? 1.5 : r * 0.7)}
                  y={node.sy - (state === 'locked' ? 1.5 : r * 0.7)}
                  width={state === 'locked' ? 3 : r * 1.4}
                  height={state === 'locked' ? 3 : r * 1.4}
                  fill={state === 'mastered' || state === 'in_progress' ? color : 'none'}
                  stroke={state === 'available' ? color : 'none'}
                  strokeWidth={1.5}
                  transform={`rotate(45 ${node.sx} ${node.sy})`}
                  opacity={op} />
              ) : state === 'locked' ? (
                <circle cx={node.sx} cy={node.sy} r={2} fill={color} opacity={op} />
              ) : state === 'available' ? (
                <circle cx={node.sx} cy={node.sy} r={r}
                  fill="none" stroke={color} strokeWidth={1.5} opacity={op} />
              ) : (
                <circle cx={node.sx} cy={node.sy} r={r} fill={color} opacity={op} />
              )}

              <circle cx={node.sx} cy={node.sy} r={14}
                fill="transparent" className="cursor-pointer"
                onMouseEnter={() => setHoveredNode(node.id)}
                onMouseLeave={() => setHoveredNode(null)}
                onClick={() => setSelectedNode(node.id)} />

              {state !== 'locked' && (
                <text x={node.sx + r + 7} y={node.sy + 3.5}
                  fill={dimmed ? '#333' : '#ccc'}
                  fontSize={isBack ? 11 : 9}
                  fontWeight={isBack ? 700 : 400}
                  className="pointer-events-none select-none"
                  opacity={dimmed ? 0.15 : state === 'available' ? 0.5 : 0.85}>
                  {node.title}
                  {isBridge && node.bridgeTo && (
                    <tspan fill={color} opacity={0.7}>{` → ${node.bridgeTo}`}</tspan>
                  )}
                </text>
              )}
            </g>
          )
        })}

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
