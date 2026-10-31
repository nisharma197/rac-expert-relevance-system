import { experts } from '@/data/experts'
export const listExperts = () => experts
export const getExpert = (id: string) => experts.find((expert) => expert.id === id) ?? experts[0]
