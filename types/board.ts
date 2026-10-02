export type BoardStatus = 'Draft' | 'Ready' | 'Ready for Matching' | 'Under Review' | 'Archived'

export interface InterviewBoard { id: string; name: string; subject: string; description?: string; date: string; status: BoardStatus; domains: string[]; candidateIds: string[] }
