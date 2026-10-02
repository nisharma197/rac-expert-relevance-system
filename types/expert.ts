export interface Expert {
  id: string
  name: string
  initials: string
  designation: string
  organization: string
  qualification: string
  experience: number
  expertise: string[]
  researchAreas: string[]
  projects: string[]
  publications: number
}

export type ContextualMatch = {
  expertId: string
  boardId: string
  overall: number
  subject: number
  candidate: number
  research: number
  profile: number
}
