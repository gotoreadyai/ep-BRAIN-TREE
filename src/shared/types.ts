// Re-export schematów paczek (jedno źródło prawdy)
export * from './pack-types'

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
