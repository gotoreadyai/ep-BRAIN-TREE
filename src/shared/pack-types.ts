// Schematy danych paczek — JEDNO ŹRÓDŁO PRAWDY
// Kontrakt z repozytoriami gniazdo-wiedzy (tree.json)

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
  branches: Record<string, BranchDef>
  nodes: TreeNode[]
  edges: TreeEdge[]
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
  type: 'definition' | 'flashcard' | 'question' | 'term'
  text: string
  answer?: string
  cost?: number        // 0/brak = darmowe, >0 = koszt w monetach
  forms?: string[]     // warianty terminu do podświetlania w tekście
}

export interface ContentPack {
  id: string
  baseId: string
  title: string
  content: Record<string, ContentItem[]>
}
