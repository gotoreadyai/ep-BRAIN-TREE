import { useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Line, QuadraticBezierLine } from '@react-three/drei'
import { useTreeStore } from '../../shared/store'
import NodeMesh from './NodeMesh'

/* Kamera leci do wybranego węzła, potem swobodny zoom */
function CameraRig({ target, selected }: { target: readonly [number, number, number]; selected: boolean }) {
  const ref = useRef<any>(null)
  const flying = useRef(false)
  const prevTarget = useRef(target)

  /* Nowy target = start fly-to */
  if (target !== prevTarget.current) { flying.current = true; prevTarget.current = target }

  useFrame(({ camera }) => {
    if (!ref.current) return
    const t = ref.current.target
    t.x += (target[0] - t.x) * 0.05
    t.y += (target[1] - t.y) * 0.05
    t.z += (target[2] - t.z) * 0.05
    /* Zoom tylko podczas fly-to, potem wheel swobodny */
    if (flying.current) {
      const d = camera.position.distanceTo(t)
      const ideal = selected ? 25 : 60
      const diff = Math.abs(d - ideal)
      camera.position.sub(t).multiplyScalar(1 + (ideal / d - 1) * 0.05).add(t)
      if (diff < 1) flying.current = false
    }
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
  const sel = selectedNodeId ? gMap.get(selectedNodeId) : null
  const camTarget = sel ? [sel.gx, sel.gy, sel.gz] as const : center

  return (
    <Canvas camera={{ fov: 50, position: [center[0], center[1] + 30, center[2] + 50], near: 0.1, far: 300 }}>
      {edges.map((edge, i) => {
        const a = gMap.get(edge.from), b = gMap.get(edge.to)
        if (!a || !b) return null
        const pa = connectedIds?.get(edge.from) ?? 0.08, pb = connectedIds?.get(edge.to) ?? 0.08
        const ep = connectedIds ? Math.max(pa, pb) : 1
        const aL = nodeStates[edge.from] === 'locked', bL = nodeStates[edge.to] === 'locked'
        const sm = (aL && bL) ? 0.05 : (aL || bL) ? 0.3 : 1
        const color = def.branches[b.branch]?.color ?? '#6b7280'
        const baseOp = edge.type === 'bridge' ? 0.3 : 0.15
        const op = baseOp * sm * ep
        if (edge.type === 'progression')
          return <Line key={i} renderOrder={0} points={[[a.gx, a.gy, a.gz], [b.gx, b.gy, b.gz]]}
            color={def.branches[backbone]?.color ?? '#ffffff'} lineWidth={3}
            opacity={(aL && bL) ? 0.03 : (aL || bL) ? 0.08 : 0.2} transparent />
        const mx = (a.gx + b.gx) / 2, mz = (a.gz + b.gz) / 2
        const my = (a.gy + b.gy) / 2 + 1.5
        return <QuadraticBezierLine key={i} renderOrder={0}
          start={[a.gx, a.gy, a.gz]} end={[b.gx, b.gy, b.gz]} mid={[mx, my, mz]}
          color={color} lineWidth={1} opacity={op} transparent />
      })}

      {galaxyNodes.map(node => (
        <NodeMesh key={node.id} node={node}
          color={def.branches[node.branch]?.color ?? '#6b7280'}
          isBackbone={node.branch === backbone}
          selected={selectedNodeId === node.id}
          hasSelection={!!selectedNodeId}
          proximity={connectedIds ? (connectedIds.get(node.id) ?? 0.08) : 1}
          state={nodeStates[node.id] ?? 'locked'}
          onClick={setSelectedNode} />
      ))}

      <CameraRig target={camTarget} selected={!!selectedNodeId} />
    </Canvas>
  )
}
