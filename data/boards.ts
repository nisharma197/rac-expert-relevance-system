import type { InterviewBoard } from '@/types/board'
export const boards: InterviewBoard[] = [
 { id:'ai-ml', name:'AI & Machine Learning', subject:'Artificial Intelligence & Machine Learning', description:'Review candidates working across intelligent systems and applied machine learning.', date:'18 Jun 2026', status:'Ready for Matching', domains:['Machine Learning','Deep Learning','Computer Vision','NLP'], candidateIds:['C001','C002','C003','C004','C005'] },
 { id:'cyber', name:'Cyber Security Systems', subject:'Cyber Security & Resilient Infrastructure', description:'Expert review board for secure systems research.', date:'04 Jul 2026', status:'Draft', domains:['Cyber Security','Cryptography','Networks'], candidateIds:[] },
 { id:'robotics', name:'Autonomous Robotics', subject:'Robotics & Autonomous Systems', description:'Assessing research talent in autonomous platforms.', date:'22 Jul 2026', status:'Under Review', domains:['Robotics','Control Systems','Computer Vision'], candidateIds:[] },
]
