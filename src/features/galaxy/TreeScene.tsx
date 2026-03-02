import { Canvas } from '@react-three/fiber'
import { OrbitControls, Line, Html } from '@react-three/drei'
import { useTreeStore } from '../../shared/store'
import type { PosNode } from '../../shared/graph'
import type { TreeEdge, NodeStatus } from '../../shared/types'
import NodeMesh from './NodeMesh'

function EdgeLine({ edge, nodeMap, dimmed, bridgeColor, nodeStates }: {
  edge: TreeEdge; nodeMap: Map<string, PosNode>; dimmed: boolean; bridgeColor: string
  nodeStates: Record<string, NodeStatus>
}) {
  const a = nodeMap.get(edge.from)
  const b = nodeMap.get(edge.to)
  if (!a || !b) return null

  const color = edge.type === 'bridge' ? bridgeColor
    : edge.type === 'progression' ? '#ffffff' : '#888888'
  const baseOpacity = edge.type === 'bridge' ? 0.6 : edge.type === 'progression' ? 0.4 : 0.2
  const width = edge.type === 'progression' ? 2.5 : 1
  const aLocked = nodeStates[edge.from] === 'locked'
  const bLocked = nodeStates[edge.to] === 'locked'
  const stateMul = (aLocked && bLocked) ? 0.05 : (aLocked || bLocked) ? 0.3 : 1

  return (
    <Line
      points={[[a.x, a.y, a.z], [b.x, b.y, b.z]]}
      color={color}
      lineWidth={width}
      opacity={dimmed ? 0.04 : baseOpacity * stateMul}
      transparent
    />
  )
}

export default function TreeScene() {
  const { def, nodes, edges, columns, nodeMap, backbone, hoveredNodeId, selectedNodeId,
    connectedIds, setHoveredNode, setSelectedNode, nodeStates, reviewDue } = useTreeStore()

  const bridgeColor = def?.branches.bridge?.color ?? '#fbbf24'

  if (!def) return null

  return (
    <Canvas orthographic
      camera={{ zoom: 22, position: [4, -16, 50], near: 0.1, far: 100 }}>
      <ambientLight intensity={0.6} />
      <pointLight position={[0, 10, 30]} intensity={0.5} />

      {columns.map(({ branch, x, label, color }) => (
        <Html key={branch} center position={[x, 3.5, 0]} style={{ pointerEvents: 'none' }}>
          <div className="text-[12px] font-bold tracking-wide uppercase" style={{ color }}>
            {label}
          </div>
        </Html>
      ))}

      {edges.map((edge, i) => {
        const isDimmed = !!connectedIds && !connectedIds.has(edge.from) && !connectedIds.has(edge.to)
        return <EdgeLine key={i} edge={edge} nodeMap={nodeMap} dimmed={isDimmed}
          bridgeColor={bridgeColor} nodeStates={nodeStates} />
      })}

      {nodes.map(node => (
        <NodeMesh
          key={node.id}
          node={node}
          color={def.branches[node.branch]?.color ?? '#6b7280'}
          isBackbone={node.branch === backbone}
          hovered={hoveredNodeId === node.id}
          selected={selectedNodeId === node.id}
          dimmed={!!connectedIds && !connectedIds.has(node.id)}
          state={nodeStates[node.id] ?? 'locked'}
          reviewDue={reviewDue.has(node.id)}
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
