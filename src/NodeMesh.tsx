import { Html } from '@react-three/drei'
import type { PosNode } from './graph'
import type { SkillTreeDef } from './types'

interface Props {
  node: PosNode
  def: SkillTreeDef
  hovered: boolean
  selected: boolean
  dimmed: boolean
  onHover: (id: string | null) => void
  onClick: (id: string) => void
}

export default function NodeMesh({ node, def, hovered, selected, dimmed, onHover, onClick }: Props) {
  const branch = def.branches[node.branch]
  const color = branch?.color ?? '#6b7280'
  const isBridge = node.branch === 'bridge'
  // Pierwsza gałąź (kręgosłup) = większa
  const isBackbone = node.branch === Object.keys(def.branches)[0]
  const size = isBackbone ? 0.6 : 0.4
  const scale = hovered ? 1.4 : selected ? 1.2 : 1

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
          color={color}
          emissive={selected || hovered ? color : '#000000'}
          emissiveIntensity={selected ? 0.6 : hovered ? 0.3 : 0}
          transparent={dimmed}
          opacity={dimmed ? 0.2 : 1}
        />
      </mesh>

      {/* Label — zawsze widoczny */}
      <Html
        center
        position={[0, -(size + 0.4), 0]}
        style={{ pointerEvents: 'none', opacity: dimmed ? 0.15 : 1 }}
      >
        <div className={`whitespace-nowrap text-center ${isBackbone ? 'text-[13px] font-bold' : 'text-[10px]'}`}
          style={{ color: dimmed ? '#555' : '#ddd' }}>
          {node.title}
        </div>
        {isBridge && !dimmed && node.bridgeTo && (
          <div className="text-[9px] text-center" style={{ color: branch?.color }}>→ {node.bridgeTo}</div>
        )}
      </Html>

      {/* Tooltip na hover/select */}
      {(hovered || selected) && node.description && (
        <Html center position={[0, size + 0.8, 0]} style={{ pointerEvents: 'none' }}>
          <div className="text-[10px] text-gray-300 bg-black/90 px-2 py-1 rounded max-w-[180px] text-center">
            {node.description}
          </div>
        </Html>
      )}
    </group>
  )
}
