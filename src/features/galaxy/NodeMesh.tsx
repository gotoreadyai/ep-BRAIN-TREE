import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html, Billboard } from '@react-three/drei'
import type { MeshBasicMaterial } from 'three'
import type { GalaxyNode } from '../../shared/graph'
import type { NodeStatus } from '../../shared/types'

interface Props {
  node: GalaxyNode; color: string; isBackbone: boolean
  selected: boolean; hasSelection: boolean; proximity: number; state: NodeStatus
  onClick: (id: string) => void
}

export default function NodeMesh({ node, color, isBackbone, selected, hasSelection, proximity, state, onClick }: Props) {
  const size = isBackbone ? 0.7 : node.branch === 'bridge' ? 0.3 : 0.45
  const scale = (state === 'locked' ? 0.4 : 1) * (selected ? 1.2 : 1)
  const stateOp = state === 'locked' ? 0.1 : state === 'available' ? 0.35 : 1
  const ringOp = (state === 'locked' ? 0.1 : state === 'available' ? 0.25 : state === 'in_progress' ? 0.4 : 0.6) * proximity

  const ringRef = useRef<MeshBasicMaterial>(null)
  useFrame(({ clock }) => {
    if (!ringRef.current || state !== 'in_progress') return
    ringRef.current.opacity = (0.4 + Math.sin(clock.elapsedTime * 1.5) * 0.15) * proximity
  })

  return (
    <group position={[node.gx, node.gy, node.gz]}>
      <Billboard>
        {/* Outline ring — zawsze widoczny */}
        <mesh scale={scale} renderOrder={10}>
          <ringGeometry args={[size * 1.1, size * 1.25, 32]} />
          <meshBasicMaterial ref={ringRef} color={color} transparent opacity={ringOp} depthTest={false} />
        </mesh>

        {/* Wypełnienie — disc */}
        <mesh scale={scale} renderOrder={10} onClick={(e) => { e.stopPropagation(); onClick(node.id) }}>
          <circleGeometry args={[size, 32]} />
          <meshBasicMaterial color={color} transparent opacity={stateOp * proximity} depthTest={false} />
        </mesh>
      </Billboard>

      {(isBackbone || selected || (hasSelection && proximity > 0.9)) && (
        <Html center position={[0, size + 0.8, 0]} style={{ pointerEvents: 'none', opacity: selected ? 1 : proximity * 0.7 }}>
          <div className="text-[11px] text-white bg-black/90 px-2 py-1 rounded max-w-[200px] text-center whitespace-nowrap">
            <div className={isBackbone && !selected ? 'text-[10px] font-semibold' : 'font-bold'}>{node.title}</div>
            {selected && node.description && <div className="text-gray-400 text-[10px] mt-0.5">{node.description}</div>}
            {selected && node.branch === 'bridge' && node.bridgeTo && <div className="text-[9px] mt-0.5" style={{ color }}>→ {node.bridgeTo}</div>}
          </div>
        </Html>
      )}
    </group>
  )
}
