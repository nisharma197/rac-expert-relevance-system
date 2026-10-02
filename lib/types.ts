export type ScoreBreakdown = { subject: number; candidate: number; research: number; profile: number }
export type Expert = { id: string; name: string; initials: string; designation: string; organization: string; qualification: string; experienceYears: number; expertise: string[]; researchAreas: string[]; skills: string[]; availability: 'Available' | 'Limited' | 'Unavailable'; score: number; accent: string }
export type Candidate = { id: string; name: string; qualification: string; expertise: string[]; researchAreas: string[]; skills: string[]; boardId: string }
export type InterviewBoard = { id: string; name: string; subject: string; domains: string[]; candidateIds: string[]; interviewDate: string; status: 'Ready' | 'Draft' | 'Completed'; matchStatus: 'Matched' | 'Pending' | 'Not run' }
export type MatchingResult = { id: string; expertId: string; boardId: string; scores: ScoreBreakdown; overall: number; matchedDomains: string[]; weakDomains: string[]; explanation: string[]; status: 'Recommended' | 'Shortlisted' | 'Under Review' | 'Selected' }
export type AuditLog = { id: string; action: string; entity: string; user: string; time: string; status: 'Completed' | 'Review' }
export type PageKey = 'dashboard' | 'matching' | 'experts' | 'candidates' | 'boards' | 'recommendations' | 'analytics' | 'reports' | 'settings' | 'audit'

export const navItems: { key: PageKey; label: string; icon: string }[] = [
  { key: 'dashboard', label: 'Overview', icon: 'LayoutDashboard' }, { key: 'matching', label: 'AI Matching', icon: 'Sparkles' }, { key: 'experts', label: 'Experts', icon: 'Users' }, { key: 'candidates', label: 'Candidates', icon: 'GraduationCap' }, { key: 'boards', label: 'Interview Boards', icon: 'PanelsTopLeft' }, { key: 'recommendations', label: 'Recommendations', icon: 'BadgeCheck' }, { key: 'analytics', label: 'Analytics', icon: 'ChartNoAxesCombined' }, { key: 'reports', label: 'Reports', icon: 'FileText' },
]
export const adminItems: { key: PageKey; label: string; icon: string }[] = [{ key: 'settings', label: 'Settings', icon: 'Settings2' }, { key: 'audit', label: 'Audit Log', icon: 'History' }]
export const pageMeta: Record<PageKey, { title: string; description: string }> = { dashboard: { title: 'Expert Intelligence Overview', description: 'A decision workspace for building stronger interview boards.' }, matching: { title: 'AI Matching', description: 'Analyze candidate domains and rank the most relevant experts.' }, experts: { title: 'Experts', description: 'Manage and review experts available for interview-board matching.' }, candidates: { title: 'Candidates', description: 'Review candidate expertise, research focus and board assignments.' }, boards: { title: 'Interview Boards', description: 'Create boards and connect candidate domains to expert intelligence.' }, recommendations: { title: 'Recommendations', description: 'Review, shortlist and finalize expert recommendations.' }, analytics: { title: 'Analytics', description: 'Understand matching activity and relevance across your programme.' }, reports: { title: 'Reports', description: 'Generate decision-ready summaries for interview boards.' }, settings: { title: 'Settings', description: 'Configure your workspace and prototype scoring model.' }, audit: { title: 'Audit Log', description: 'A transparent history of administrator actions.' } }

export const experts: Expert[] = [
 { id:'e1', name:'Dr. Arvind Sharma', initials:'AS', designation:'Senior Scientist', organization:'Defence Research Lab', qualification:'Ph.D. Computer Science', experienceYears:18, expertise:['Artificial Intelligence','Machine Learning','Deep Learning','Computer Vision'], researchAreas:['Autonomous Systems','Neural Networks','Perception'], skills:['Python','PyTorch','Computer Vision'], availability:'Available', score:94.7, accent:'from-cyan-500 to-blue-600' },
 { id:'e2', name:'Dr. Neha Verma', initials:'NV', designation:'Principal Researcher', organization:'Advanced Computing Centre', qualification:'Ph.D. AI & Robotics', experienceYears:14, expertise:['Machine Learning','Robotics','NLP'], researchAreas:['Human-Robot Interaction','NLP'], skills:['TensorFlow','ROS','Python'], availability:'Available', score:91.7, accent:'from-violet-500 to-indigo-600' },
 { id:'e3', name:'Dr. Rohan Mehta', initials:'RM', designation:'Technical Director', organization:'Aero Systems Institute', qualification:'M.Tech Aerospace Engineering', experienceYears:21, expertise:['Autonomous Systems','Computer Vision','Signal Processing'], researchAreas:['UAV Navigation','Sensor Fusion'], skills:['MATLAB','C++','Embedded AI'], availability:'Limited', score:89.8, accent:'from-amber-400 to-orange-500' },
 { id:'e4', name:'Dr. Kavita Iyer', initials:'KI', designation:'Associate Professor', organization:'Institute of Technology', qualification:'Ph.D. Information Security', experienceYears:12, expertise:['Cyber Security','NLP','Machine Learning'], researchAreas:['Threat Intelligence','Secure AI'], skills:['Python','Cryptography','LLMs'], availability:'Available', score:87.4, accent:'from-emerald-400 to-teal-600' },
 { id:'e5', name:'Dr. Sameer Rao', initials:'SR', designation:'Lead Scientist', organization:'Systems Engineering Group', qualification:'Ph.D. Electronics', experienceYears:16, expertise:['Signal Processing','Electronics','Robotics'], researchAreas:['Radar Systems','Edge Computing'], skills:['MATLAB','Verilog','Embedded Systems'], availability:'Available', score:84.9, accent:'from-rose-400 to-pink-600' },
]
export const candidates: Candidate[] = [
 { id:'C001', name:'Ananya Menon', qualification:'M.Tech Computer Science', expertise:['Machine Learning','Computer Vision','Deep Learning'], researchAreas:['Medical Imaging','Representation Learning'], skills:['Python','PyTorch','SQL'], boardId:'b1' },
 { id:'C002', name:'Rahul Kapoor', qualification:'M.Tech Artificial Intelligence', expertise:['NLP','Neural Networks','Machine Learning'], researchAreas:['Language Models','Information Retrieval'], skills:['Python','Transformers','TensorFlow'], boardId:'b1' },
 { id:'C003', name:'Ishita Nair', qualification:'M.E. Robotics', expertise:['Robotics','Autonomous Systems','Computer Vision'], researchAreas:['Navigation','Sensor Fusion'], skills:['ROS','C++','OpenCV'], boardId:'b2' },
 { id:'C004', name:'Vikram Singh', qualification:'M.Tech Cyber Security', expertise:['Cyber Security','Cryptography','Network Security'], researchAreas:['Threat Detection','Secure Systems'], skills:['Python','Linux','Wireshark'], boardId:'b3' },
]
export const boards: InterviewBoard[] = [
 { id:'b1', name:'AI & Machine Learning', subject:'Artificial Intelligence & Machine Learning', domains:['Machine Learning','Deep Learning','Computer Vision','NLP'], candidateIds:['C001','C002'], interviewDate:'18 Oct 2026', status:'Ready', matchStatus:'Matched' },
 { id:'b2', name:'Autonomous Systems', subject:'Robotics & Autonomous Systems', domains:['Robotics','Computer Vision','Signal Processing'], candidateIds:['C003'], interviewDate:'24 Oct 2026', status:'Ready', matchStatus:'Pending' },
 { id:'b3', name:'Cyber Defence', subject:'Cyber Security', domains:['Cyber Security','Cryptography','Network Security'], candidateIds:['C004'], interviewDate:'02 Nov 2026', status:'Draft', matchStatus:'Not run' },
 { id:'b4', name:'Electronic Systems', subject:'Electronics & Communication', domains:['Electronics','Signal Processing','Embedded Systems'], candidateIds:[], interviewDate:'11 Nov 2026', status:'Draft', matchStatus:'Not run' },
]
export const results: MatchingResult[] = [
 { id:'m1', expertId:'e1', boardId:'b1', scores:{subject:97,candidate:94,research:91,profile:93}, overall:94.7, matchedDomains:['Artificial Intelligence','Machine Learning','Deep Learning','Computer Vision'], weakDomains:['NLP'], explanation:['Strong alignment with interview-board subject','Strong overlap with candidate expertise','Relevant autonomous systems research','18 years of professional experience'], status:'Recommended' },
 { id:'m2', expertId:'e2', boardId:'b1', scores:{subject:94,candidate:91,research:88,profile:93}, overall:91.7, matchedDomains:['Machine Learning','NLP','Robotics'], weakDomains:['Computer Vision'], explanation:['Strong machine-learning alignment','Relevant language-model research','Extensive academic experience'], status:'Shortlisted' },
 { id:'m3', expertId:'e3', boardId:'b1', scores:{subject:89,candidate:91,research:87,profile:92}, overall:89.8, matchedDomains:['Computer Vision','Autonomous Systems'], weakDomains:['NLP'], explanation:['Strong computer-vision and autonomy overlap','Excellent professional experience'], status:'Under Review' },
]
export const auditLogs: AuditLog[] = [
 {id:'a1',action:'Matching run completed',entity:'AI & Machine Learning',user:'Admin / RAC',time:'Today, 10:42 AM',status:'Completed'}, {id:'a2',action:'Expert shortlisted',entity:'Dr. Neha Verma',user:'Admin / RAC',time:'Today, 10:38 AM',status:'Completed'}, {id:'a3',action:'Interview board created',entity:'Autonomous Systems',user:'Admin / RAC',time:'Yesterday, 04:16 PM',status:'Completed'}, {id:'a4',action:'Report generated',entity:'AI & Machine Learning',user:'Admin / RAC',time:'Yesterday, 02:11 PM',status:'Completed'}, {id:'a5',action:'Expert profile updated',entity:'Dr. Sameer Rao',user:'Admin / RAC',time:'18 Sep 2026, 11:08 AM',status:'Review'},
]

export const getExpert = (id: string) => experts.find((expert) => expert.id === id) ?? experts[0]
export const getBoard = (id: string) => boards.find((board) => board.id === id) ?? boards[0]
export const getResult = (id: string) => results.find((result) => result.id === id) ?? results[0]
export const domains = ['Artificial Intelligence','Machine Learning','Deep Learning','Computer Vision','NLP','Robotics','Cyber Security','Signal Processing']
export const api = { experts: () => Promise.resolve(experts), candidates: () => Promise.resolve(candidates), boards: () => Promise.resolve(boards), matchingResults: () => Promise.resolve(results) }

export function scoreColor(score: number) { return score >= 90 ? 'text-cyan-700' : score >= 80 ? 'text-violet-700' : 'text-amber-700' }
export function scoreBg(score: number) { return score >= 90 ? 'bg-cyan-50 text-cyan-700 border-cyan-100' : score >= 80 ? 'bg-violet-50 text-violet-700 border-violet-100' : 'bg-amber-50 text-amber-700 border-amber-100' }

export const recommendations = results.map((result) => ({ ...result, expert: getExpert(result.expertId), board: getBoard(result.boardId) }))
export const chartData = [{label:'AI / ML',experts:42,candidates:28,score:92},{label:'Robotics',experts:31,candidates:16,score:88},{label:'Cyber',experts:27,candidates:19,score:86},{label:'Electronics',experts:36,candidates:24,score:84},{label:'Materials',experts:18,candidates:12,score:81}]
export const trendData = [62,68,64,76,72,84,91,88,96,92,104,112]

export const safePageKey = (value: string): PageKey => (Object.keys(pageMeta).includes(value) ? value as PageKey : 'dashboard')
export const iconNames = ['LayoutDashboard','Sparkles','Users','GraduationCap','PanelsTopLeft','BadgeCheck','ChartNoAxesCombined','FileText','Settings2','History']
export type IconName = typeof iconNames[number]
