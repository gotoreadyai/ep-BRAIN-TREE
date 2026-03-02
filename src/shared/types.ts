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
