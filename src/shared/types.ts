// Re-export schematów paczek (jedno źródło prawdy)
export * from './pack-types'

// --- Typy wewnętrzne aplikacji ---

export type NodeStatus = 'mastered' | 'in_progress' | 'available' | 'locked'

export const STATUS_LABEL: Record<NodeStatus, string> = {
  mastered: 'Opanowane', in_progress: 'W trakcie', available: 'Dostępne', locked: 'Zablokowane'
}
export const STATUS_COLOR: Record<NodeStatus, string> = {
  mastered: '#22c55e', in_progress: '#eab308', available: '#3b82f6', locked: '#6b7280'
}

// Krawędź odkrycia — rejestruje interakcję ucznia z elementem treści
export interface DiscoveryEdge {
  id: string           // "${treeId}::${nodeId}::${itemIndex}"
  treeId: string
  nodeId: string
  itemIndex: number
  hits: number
  firstSeen: number    // timestamp ms
  lastSeen: number     // timestamp ms
}

// --- Katalog paczek (GitHub) ---

export type PackType = 'paczka-bazowa' | 'paczka-rozszerzenie' | 'paczka-kontentowa'

export interface PackEntry {
  org: string
  repo: string
  description: string
  topics: string[]
  packType: PackType
  subject: string
}
