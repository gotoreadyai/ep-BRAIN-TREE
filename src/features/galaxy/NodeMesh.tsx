import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import type { MeshStandardMaterial } from 'three'
import type { PosNode } from '../../shared/graph'
import type { NodeStatus } from '../../shared/types'

interface Props {
  node: PosNode
  color: string
  isBackbone: boolean
  hovered: boolean
  selected: boolean
  dimmed: boolean
  state: NodeStatus
  reviewDue: boolean
  onHover: (id: string | null) => void
  onClick: (id: string) => void
}

export default function NodeMesh({ node, color, isBackbone, hovered, selected, dimmed, state, reviewDue, onHover, onClick }: Props) {
  const isBridge = node.branch === 'bridge'
  const size = isBackbone ? 0.6 : 0.4
  const scale = (state === 'locked' ? 0.4 : 1) * (hovered ? 1.4 : selected ? 1.2 : 1)
  const stateOp = state === 'locked' ? 0.1 : state === 'available' ? 0.35 : 1
  const opacity = dimmed ? 0.06 : stateOp

  const matRef = useRef<MeshStandardMaterial>(null)
  useFrame(({ clock }) => {
    if (!matRef.current || dimmed) return
    if (reviewDue && state === 'mastered') {
      matRef.current.emissiveIntensity = 0.4 + Math.sin(clock.elapsedTime * 2.5) * 0.35
    } else if (state === 'in_progress') {
      matRef.current.emissiveIntensity = 0.15 + Math.sin(clock.elapsedTime * 1.5) * 0.1
    }
  })

  const baseEmissive = selected ? 0.6 : hovered ? 0.3 : reviewDue ? 0.4 : state === 'in_progress' ? 0.15 : 0

  return (
    <group position={[node.x, node.y, node.z]}>
      <mesh
        scale={scale}
        rotation={isBridge ? [Math.PI / 4, 0, Math.PI / 4] : undefined}
        onPointerOver={(e) => { e.stopPropagation(); onHover(node.id) }}
        onPointerOut={() => onHover(null)}
        onClick={(e) => { e.stopPropagation(); onClick(node.id) }}
      >
        {isBridge
          ? <boxGeometry args={[size, size, size]} />
          : <sphereGeometry args={[size, 16, 16]} />
        }
        <meshStandardMaterial
          ref={matRef}
          color={color}
          emissive={color}
          emissiveIntensity={baseEmissive}
          transparent
          opacity={opacity}
        />
      </mesh>

      {state !== 'locked' && (
        <Html center position={[0, -(size + 0.4), 0]}
          style={{ pointerEvents: 'none', opacity: dimmed ? 0.1 : stateOp }}>
          <div className={`whitespace-nowrap text-center ${isBackbone ? 'text-[13px] font-bold' : 'text-[10px]'}`}
            style={{ color: dimmed ? '#555' : '#ddd' }}>
            {node.title}
          </div>
          {isBridge && !dimmed && node.bridgeTo && (
            <div className="text-[9px] text-center" style={{ color }}>→ {node.bridgeTo}</div>
          )}
        </Html>
      )}

      {(hovered || selected) && node.description && state !== 'locked' && (
        <Html center position={[0, size + 0.8, 0]} style={{ pointerEvents: 'none' }}>
          <div className="text-[10px] text-gray-300 bg-black/90 px-2 py-1 rounded max-w-[180px] text-center">
            {node.description}
          </div>
        </Html>
      )}
    </group>
  )
}
