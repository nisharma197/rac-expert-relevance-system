export interface Candidate {
  id: string
  name: string
  qualification: string
  expertise: string[]
  researchAreas: string[]
  boardId: string
  initials: string
  skills?: string[]
  projects?: string[]
  thesis?: string
  publications?: number
  experience?: number
  certifications?: string[]
  resumeStatus?: 'Not uploaded' | 'Uploaded' | 'Profile extracted' | 'Reviewed'
  profileSource?: 'Resume' | 'Manual Entry'
  domainProfile?: { domain: string; score: number }[]
}
