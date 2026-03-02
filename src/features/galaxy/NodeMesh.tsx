import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import { AdditiveBlending } from 'three'
import type { MeshStandardMaterial } from 'three'
import type { PosNode } from '../../shared/graph'
import type { NodeStatus } from '../../shared/types'

interface Props {
  node: PosNode; color: string; isBackbone: boolean
  hovered: boolean; selected: boolean; dimmed: boolean
  state: NodeStatus; reviewDue: boolean
  onHover: (id: string | null) => void; onClick: (id: string) => void
}

export default function NodeMesh({ node, color, isBackbone, hovered, selected, dimmed, state, reviewDue, onHover, onClick }: Props) {
  const isBridge = node.branch === 'bridge'
  const size = isBackbone ? 0.7 : isBridge ? 0.3 : 0.45
  const scale = (state === 'locked' ? 0.4 : 1) * (hovered ? 1.4 : selected ? 1.2 : 1)
  const stateOp = state === 'locked' ? 0.1 : state === 'available' ? 0.35 : 1
  const opacity = dimmed ? 0.06 : stateOp
  const additive = state === 'mastered' && !dimmed

  const matRef = useRef<MeshStandardMaterial>(null)
  useFrame(({ clock }) => {
    if (!matRef.current || dimmed) return
    if (reviewDue && state === 'mastered')
      matRef.current.emissiveIntensity = 0.5 + Math.sin(clock.elapsedTime * 2.5) * 0.4
    else if (state === 'in_progress')
      matRef.current.emissiveIntensity = 0.2 + Math.sin(clock.elapsedTime * 1.5) * 0.15
  })

  const baseEmissive = selected ? 0.8 : hovered ? 0.5
    : state === 'mastered' ? 0.3 : state === 'in_progress' ? 0.2 : 0

  return (
    <group position={[node.x, node.y, node.z]}>
      <mesh scale={scale}
        rotation={isBridge ? [Math.PI / 4, 0, Math.PI / 4] : undefined}
        onPointerOver={(e) => { e.stopPropagation(); onHover(node.id) }}
        onPointerOut={() => onHover(null)}
        onClick={(e) => { e.stopPropagation(); onClick(node.id) }}>
        {isBridge
          ? <boxGeometry args={[size, size, size]} />
          : <sphereGeometry args={[size, 12, 12]} />}
        <meshStandardMaterial ref={matRef}
          color={color} emissive={color} emissiveIntensity={baseEmissive}
          transparent opacity={opacity}
          blending={additive ? AdditiveBlending : undefined}
          depthWrite={!additive} />
      </mesh>

      {isBackbone && state === 'mastered' && !dimmed && (
        <pointLight color={color} intensity={0.8} distance={12} />
      )}

      {(hovered || selected) && state !== 'locked' && (
        <Html center position={[0, size + 0.8, 0]} style={{ pointerEvents: 'none' }}>
          <div className="text-[11px] text-white bg-black/90 px-2 py-1 rounded max-w-[200px] text-center">
            <div className="font-bold">{node.title}</div>
            {node.description && <div className="text-gray-400 text-[10px] mt-0.5">{node.description}</div>}
            {isBridge && node.bridgeTo && <div className="text-[9px] mt-0.5" style={{ color }}>→ {node.bridgeTo}</div>}
          </div>
        </Html>
      )}
    </group>
  )
}
