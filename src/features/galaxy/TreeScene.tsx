import { useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Line, Stars, Sparkles } from '@react-three/drei'
import { useTreeStore } from '../../shared/store'
import type { PosNode } from '../../shared/graph'
import type { TreeEdge, NodeStatus } from '../../shared/types'
import NodeMesh from './NodeMesh'

/* Układy słoneczne — słońca (backbone) na spirali, planety na orbitach */
function galaxyLayout(nodes: PosNode[], edges: TreeEdge[], backbone: string): PosNode[] {
  const adj = new Map<string, string[]>()
  for (const e of edges) {
    if (!adj.has(e.from)) adj.set(e.from, [])
    if (!adj.has(e.to)) adj.set(e.to, [])
    adj.get(e.from)!.push(e.to)
    adj.get(e.to)!.push(e.from)
  }
  const pos = new Map<string, [number, number, number]>()

  /* Słońca po spirali — dysk w XZ, Y to grubość */
  const suns = nodes.filter(n => n.branch === backbone).sort((a, b) => a.tier - b.tier)
  suns.forEach((n, i) => {
    const a = i * 0.7, r = 10 + i * 3.5
    pos.set(n.id, [Math.cos(a) * r, Math.sin(a * 0.5) * 4, Math.sin(a) * r])
  })

  /* Znajdź macierzyste słońce (1–2 hopy po krawędziach) */
  const findSun = (id: string): string => {
    for (const nb of adj.get(id) ?? []) if (pos.has(nb)) return nb
    for (const nb of adj.get(id) ?? [])
      for (const nb2 of adj.get(nb) ?? []) if (pos.has(nb2)) return nb2
    return suns[0].id
  }

  /* Grupuj planety per słońce */
  const sys = new Map<string, PosNode[]>()
  for (const n of nodes) {
    if (pos.has(n.id)) continue
    const sun = findSun(n.id)
    if (!sys.has(sun)) sys.set(sun, [])
    sys.get(sun)!.push(n)
  }

  /* Orbity — planety wokół słońc */
  for (const [sid, planets] of sys) {
    const [sx, sy, sz] = pos.get(sid)!
    planets.forEach((p, i) => {
      const a = (i / planets.length) * Math.PI * 2
      const r = p.branch === 'bridge' ? 7 : 4
      pos.set(p.id, [sx + Math.cos(a) * r, sy + Math.sin(a * 2) * 1.5, sz + Math.sin(a) * r])
    })
  }

  return nodes.map(n => {
    const [x, y, z] = pos.get(n.id) ?? [0, 0, 0]
    return { ...n, x, y, z }
  })
}

/* Kamera leci do wybranego węzła, zoom in, auto-rotate zatrzymuje się */
function CameraRig({ target, selected }: { target: readonly [number, number, number]; selected: boolean }) {
  const ref = useRef<any>(null)
  useFrame(({ camera }) => {
    if (!ref.current) return
    const t = ref.current.target
    t.x += (target[0] - t.x) * 0.05
    t.y += (target[1] - t.y) * 0.05
    t.z += (target[2] - t.z) * 0.05
    const d = camera.position.distanceTo(t)
    const ideal = selected ? 25 : 60
    camera.position.sub(t).multiplyScalar(1 + (ideal / d - 1) * 0.05).add(t)
    ref.current.update()
  })
  return <OrbitControls ref={ref} enablePan enableZoom enableRotate
    enableDamping dampingFactor={0.05}
    autoRotate={!selected} autoRotateSpeed={0.3}
    minDistance={15} maxDistance={120} />
}

function EdgeLine({ edge, nodeMap, dimmed, bridgeColor, nodeStates }: {
  edge: TreeEdge; nodeMap: Map<string, PosNode>; dimmed: boolean; bridgeColor: string
  nodeStates: Record<string, NodeStatus>
}) {
  const a = nodeMap.get(edge.from), b = nodeMap.get(edge.to)
  if (!a || !b) return null
  const color = edge.type === 'bridge' ? bridgeColor
    : edge.type === 'progression' ? '#ffffff' : '#888888'
  const baseOp = edge.type === 'bridge' ? 0.3 : edge.type === 'progression' ? 0.15 : 0.08
  const aLocked = nodeStates[edge.from] === 'locked'
  const bLocked = nodeStates[edge.to] === 'locked'
  const stateMul = (aLocked && bLocked) ? 0.05 : (aLocked || bLocked) ? 0.3 : 1
  return (
    <Line points={[[a.x, a.y, a.z], [b.x, b.y, b.z]]}
      color={color} lineWidth={edge.type === 'progression' ? 1.5 : 0.5}
      opacity={dimmed ? 0.02 : baseOp * stateMul} transparent />
  )
}

export default function TreeScene() {
  const { def, nodes, edges, backbone, hoveredNodeId, selectedNodeId,
    connectedIds, setHoveredNode, setSelectedNode, nodeStates, reviewDue } = useTreeStore()

  const { gNodes, gMap, center } = useMemo(() => {
    const gn = galaxyLayout(nodes, edges, backbone)
    const cx = gn.reduce((s, n) => s + n.x, 0) / (gn.length || 1)
    const cy = gn.reduce((s, n) => s + n.y, 0) / (gn.length || 1)
    const cz = gn.reduce((s, n) => s + n.z, 0) / (gn.length || 1)
    return { gNodes: gn, gMap: new Map(gn.map(n => [n.id, n])), center: [cx, cy, cz] as const }
  }, [nodes, edges, backbone])

  if (!def) return null
  const bridgeColor = def.branches.bridge?.color ?? '#fbbf24'
  const sel = selectedNodeId ? gMap.get(selectedNodeId) : null
  const camTarget = sel ? [sel.x, sel.y, sel.z] as const : center

  return (
    <Canvas camera={{ fov: 50, position: [center[0], center[1] + 30, center[2] + 50], near: 0.1, far: 300 }}>
      <ambientLight intensity={0.4} />
      <pointLight position={[0, 10, 30]} intensity={0.3} />

      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      <Sparkles count={40} scale={[60, 50, 30]} size={2} speed={0.3} opacity={0.4} />

      {edges.map((edge, i) => {
        const isDimmed = !!connectedIds && !connectedIds.has(edge.from) && !connectedIds.has(edge.to)
        return <EdgeLine key={i} edge={edge} nodeMap={gMap} dimmed={isDimmed}
          bridgeColor={bridgeColor} nodeStates={nodeStates} />
      })}

      {gNodes.map(node => (
        <NodeMesh key={node.id} node={node}
          color={def.branches[node.branch]?.color ?? '#6b7280'}
          isBackbone={node.branch === backbone}
          hovered={hoveredNodeId === node.id}
          selected={selectedNodeId === node.id}
          dimmed={!!connectedIds && !connectedIds.has(node.id)}
          state={nodeStates[node.id] ?? 'locked'}
          reviewDue={reviewDue.has(node.id)}
          onHover={setHoveredNode} onClick={setSelectedNode} />
      ))}

      <CameraRig target={camTarget} selected={!!selectedNodeId} />
    </Canvas>
  )
}
