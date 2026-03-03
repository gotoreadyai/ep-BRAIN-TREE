import { useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Line, Stars, Sparkles } from '@react-three/drei'
import { useTreeStore } from '../../shared/store'
import type { GalaxyNode } from '../../shared/graph'
import NodeMesh from './NodeMesh'

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

export default function TreeScene() {
  const { def, galaxyNodes, edges, backbone, selectedNodeId,
    connectedIds, setSelectedNode, nodeStates } = useTreeStore()

  /* Pozycje stabilne — zależą TYLKO od galaxyNodes (obliczanych raz przy load) */
  const { gMap, center } = useMemo(() => {
    const nonBridge = galaxyNodes.filter(n => n.branch !== 'bridge')
    const cx = nonBridge.reduce((s, n) => s + n.gx, 0) / (nonBridge.length || 1)
    const cy = nonBridge.reduce((s, n) => s + n.gy, 0) / (nonBridge.length || 1)
    const cz = nonBridge.reduce((s, n) => s + n.gz, 0) / (nonBridge.length || 1)
    return { gMap: new Map(galaxyNodes.map(n => [n.id, n])), center: [cx, cy, cz] as const }
  }, [galaxyNodes])

  if (!def) return null
  const bridgeColor = def.branches.bridge?.color ?? '#fbbf24'
  const sel = selectedNodeId ? gMap.get(selectedNodeId) : null
  const camTarget = sel ? [sel.gx, sel.gy, sel.gz] as const : center

  return (
    <Canvas camera={{ fov: 50, position: [center[0], center[1] + 30, center[2] + 50], near: 0.1, far: 300 }}>

      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      <Sparkles count={40} scale={[60, 50, 30]} size={2} speed={0.3} opacity={0.4} />

      {edges.map((edge, i) => {
        const a = gMap.get(edge.from), b = gMap.get(edge.to)
        if (!a || !b) return null
        const ep = connectedIds ? Math.max(connectedIds.get(edge.from) ?? 0.08, connectedIds.get(edge.to) ?? 0.08) : 1
        const aL = nodeStates[edge.from] === 'locked', bL = nodeStates[edge.to] === 'locked'
        const sm = (aL && bL) ? 0.05 : (aL || bL) ? 0.3 : 1
        const color = edge.type === 'bridge' ? bridgeColor : edge.type === 'progression' ? '#ffffff' : '#888888'
        const baseOp = edge.type === 'bridge' ? 0.3 : edge.type === 'progression' ? 0.15 : 0.08
        return <Line key={i} points={[[a.gx, a.gy, a.gz], [b.gx, b.gy, b.gz]]}
          color={color} lineWidth={edge.type === 'progression' ? 1.5 : 0.5}
          opacity={baseOp * sm * ep} transparent />
      })}

      {galaxyNodes.map(node => (
        <NodeMesh key={node.id} node={node}
          color={def.branches[node.branch]?.color ?? '#6b7280'}
          isBackbone={node.branch === backbone}
          selected={selectedNodeId === node.id}
          proximity={connectedIds ? (connectedIds.get(node.id) ?? 0.08) : 1}
          state={nodeStates[node.id] ?? 'locked'}
          onClick={setSelectedNode} />
      ))}

      <CameraRig target={camTarget} selected={!!selectedNodeId} />
    </Canvas>
  )
}
