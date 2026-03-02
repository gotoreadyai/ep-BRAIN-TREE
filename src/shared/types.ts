export interface BranchDef {
  label: string
  color: string   // hex CSS, np. '#f43f5e'
}

export interface TreeNode {
  id: string
  title: string
  branch: string       // klucz z SkillTreeDef.branches
  tier: number         // 0 = start, rośnie w dół
  description?: string
  bridgeTo?: string    // tylko dla węzłów-mostów — nazwa przedmiotu docelowego
  terms?: string[]     // trudne słowa powiązane z węzłem (np. 'hybris', 'katharsis')
}

export interface TreeEdge {
  from: string
  to: string
  type: 'progression' | 'branch' | 'bridge'
}

export interface SkillTreeDef {
  id: string
  title: string
  description?: string
  // Gałęzie — kolejność kluczy = kolejność kolumn (pierwsza = kręgosłup)
  // Klucz 'bridge' jest specjalny — zawsze skrajnie po prawej
  branches: Record<string, BranchDef>
  nodes: TreeNode[]
  edges: TreeEdge[]
}

export type NodeStatus = 'mastered' | 'in_progress' | 'available' | 'locked'

export const STATUS_LABEL: Record<NodeStatus, string> = {
  mastered: 'Opanowane', in_progress: 'W trakcie', available: 'Dostępne', locked: 'Zablokowane'
}
export const STATUS_COLOR: Record<NodeStatus, string> = {
  mastered: '#22c55e', in_progress: '#eab308', available: '#3b82f6', locked: '#6b7280'
}

// --- Paczki ---

export interface TreePack {
  id: string
  baseId: string
  title: string
  nodes: TreeNode[]
  edges: TreeEdge[]
}

export interface ContentItem {
  type: 'definition' | 'flashcard' | 'question'
  text: string
  answer?: string
}

export interface ContentPack {
  id: string
  baseId: string
  title: string
  content: Record<string, ContentItem[]>
}

export type PackType = 'paczka-bazowa' | 'paczka-rozszerzenie' | 'paczka-kontentowa'

export interface PackEntry {
  org: string
  repo: string
  description: string
  topics: string[]
  packType: PackType
  subject: string
}
