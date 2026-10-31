import { experts } from '@/data/experts'
import type { ContextualMatch } from '@/types/expert'
export function getMatches(boardId = 'ai-ml'): ContextualMatch[] { return experts.map((expert, index) => ({ expertId: expert.id, boardId, subject: 97 - index * 3, candidate: 94 - index * 2, research: 91 - index * 2, profile: 93 - index, overall: [94.7,91.7,89.8,87.6][index] ?? 84 })) }
