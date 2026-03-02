import { Canvas } from '@react-three/fiber'
import { OrbitControls, Line, Html } from '@react-three/drei'
import { useMemo } from 'react'
import { useTreeStore } from './store'
import type { PosNode } from './graph'
import type { TreeEdge } from './types'
import NodeMesh from './NodeMesh'

function EdgeLine({ edge, nodeMap, dimmed, bridgeColor }: {
  edge: TreeEdge; nodeMap: Map<string, PosNode>; dimmed: boolean; bridgeColor: string
}) {
  const a = nodeMap.get(edge.from)
  const b = nodeMap.get(edge.to)
  if (!a || !b) return null

  const color = edge.type === 'bridge' ? bridgeColor
    : edge.type === 'progression' ? '#ffffff' : '#888888'
  const baseOpacity = edge.type === 'bridge' ? 0.6 : edge.type === 'progression' ? 0.4 : 0.2
  const width = edge.type === 'progression' ? 2.5 : 1

  return (
    <Line
      points={[[a.x, a.y, a.z], [b.x, b.y, b.z]]}
      color={color}
      lineWidth={width}
      opacity={dimmed ? 0.04 : baseOpacity}
      transparent
    />
  )
}

export default function TreeScene() {
  const { def, nodes, edges, columns, hoveredNodeId, selectedNodeId, setHoveredNode, setSelectedNode } = useTreeStore()

  const nodeMap = useMemo(() => {
    const m = new Map<string, PosNode>()
    for (const n of nodes) m.set(n.id, n)
    return m
  }, [nodes])

  const activeId = hoveredNodeId ?? selectedNodeId
  const connectedIds = useMemo(() => {
    if (!activeId) return null
    const ids = new Set<string>([activeId])
    for (const e of edges) {
      if (e.from === activeId) ids.add(e.to)
      if (e.to === activeId) ids.add(e.from)
    }
    return ids
  }, [edges, activeId])

  const bridgeColor = def?.branches.bridge?.color ?? '#fbbf24'

  if (!def) return null

  return (
    <Canvas
      orthographic
      camera={{ zoom: 22, position: [4, -16, 50], near: 0.1, far: 100 }}
      style={{ background: '#0a0a0f' }}
    >
      <ambientLight intensity={0.6} />
      <pointLight position={[0, 10, 30]} intensity={0.5} />

      {/* Nagłówki kolumn */}
      {columns.map(({ branch, x, label, color }) => (
        <Html key={branch} center position={[x, 3.5, 0]} style={{ pointerEvents: 'none' }}>
          <div className="text-[12px] font-bold tracking-wide uppercase" style={{ color }}>
            {label}
          </div>
        </Html>
      ))}

      {/* Krawędzie */}
      {edges.map((edge, i) => {
        const isDimmed = !!connectedIds && !connectedIds.has(edge.from) && !connectedIds.has(edge.to)
        return <EdgeLine key={i} edge={edge} nodeMap={nodeMap} dimmed={isDimmed} bridgeColor={bridgeColor} />
      })}

      {/* Węzły */}
      {nodes.map(node => (
        <NodeMesh
          key={node.id}
          node={node}
          def={def}
          hovered={hoveredNodeId === node.id}
          selected={selectedNodeId === node.id}
          dimmed={!!connectedIds && !connectedIds.has(node.id)}
          onHover={setHoveredNode}
          onClick={setSelectedNode}
        />
      ))}

      <OrbitControls
        enablePan enableZoom enableRotate={false}
        target={[4, -16, 0]}
        minZoom={10} maxZoom={80}
      />
    </Canvas>
  )
}
