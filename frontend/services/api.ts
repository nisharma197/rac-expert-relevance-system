/**
 * DRDO RAC Expert Relevance System — Frontend API Service
 * Connects frontend views to backend REST APIs with graceful local fallback.
 */

import { Expert } from '@/types/expert';
import { Candidate } from '@/types/candidate';
import { InterviewBoard } from '@/types/board';
import { experts as seedExperts } from '@/data/experts';
import { candidates as seedCandidates } from '@/data/candidates';
import { boards as seedBoards } from '@/data/boards';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

/**
 * Maps a backend Expert document to the frontend Expert shape.
 */
export const mapBackendExpert = (doc: any): Expert => ({
  id: doc._id || doc.id,
  name: doc.fullName || doc.name,
  initials: (doc.fullName || doc.name || 'EX')
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase(),
  designation: doc.designation || 'Scientist',
  organization: doc.organization || 'Defence Research and Development Organisation',
  qualification: doc.education || doc.qualification || 'M.Tech',
  experience: doc.experienceYears ?? doc.experience ?? 5,
  expertise: doc.technicalSkills || doc.expertise || [],
  researchAreas: doc.researchAreas || [],
  projects: doc.projects || [],
  publications: Array.isArray(doc.publications) ? doc.publications.length : (doc.publications || 0),
  skills: doc.technicalSkills || doc.skills || [],
  resumeStatus: doc.resumeUrl ? 'Profile extracted' : 'Not uploaded',
  profileSource: doc.resumeUrl ? 'Resume' : 'Manual Entry'
});

/**
 * Maps a backend Candidate document to the frontend Candidate shape.
 */
export const mapBackendCandidate = (doc: any): Candidate => ({
  id: doc._id || doc.id,
  name: doc.fullName || doc.name,
  initials: (doc.fullName || doc.name || 'CA')
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase(),
  qualification: doc.education || doc.qualification || 'B.Tech',
  expertise: doc.technicalSkills || doc.expertise || [],
  researchAreas: doc.researchAreas || [],
  boardId: doc.boardId || '',
  skills: doc.technicalSkills || doc.skills || [],
  projects: doc.projects || [],
  experience: doc.experienceYears ?? doc.experience ?? 0,
  resumeStatus: doc.resumeUrl ? 'Profile extracted' : 'Not uploaded',
  profileSource: doc.resumeUrl ? 'Resume' : 'Manual Entry'
});

/**
 * Maps a backend InterviewBoard document to the frontend InterviewBoard shape.
 */
export const mapBackendBoard = (doc: any): InterviewBoard => ({
  id: doc._id || doc.id,
  name: doc.boardTitle || doc.name,
  subject: doc.subject,
  description: doc.description || '',
  date: doc.createdAt ? new Date(doc.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '18 Oct 2026',
  status: doc.status === 'ready' ? 'Ready' : doc.status === 'completed' ? 'Archived' : 'Draft',
  domains: doc.requiredExpertise || doc.domains || [],
  candidateIds: (doc.candidateIds || []).map((c: any) => (typeof c === 'string' ? c : c._id || c.id))
});

/**
 * Fetches all experts from the backend API.
 */
export async function getExperts(): Promise<Expert[]> {
  try {
    const res = await fetch(`${API_BASE}/experts`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    if (json.success && Array.isArray(json.data) && json.data.length > 0) {
      return json.data.map(mapBackendExpert);
    }
    return seedExperts;
  } catch {
    return seedExperts;
  }
}

/**
 * Creates an expert via the backend API.
 */
export async function createExpertApi(data: Partial<Expert>): Promise<Expert> {
  const payload = {
    fullName: data.name,
    email: (data as any).email || `${(data.name || 'expert').toLowerCase().replace(/[^a-z0-9]/g, '.')}@example.com`,
    designation: data.designation,
    organization: data.organization,
    education: data.qualification,
    specialization: (data.expertise && data.expertise[0]) || 'Artificial Intelligence',
    technicalSkills: data.expertise || [],
    researchAreas: data.researchAreas || [],
    experienceYears: data.experience || 5,
    projects: data.projects || [],
    publications: (data as any).publicationList || []
  };

  const res = await fetch(`${API_BASE}/experts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Failed to create expert (HTTP ${res.status})`);
  }

  const json = await res.json();
  return mapBackendExpert(json.data);
}

/**
 * Fetches all candidates from the backend API.
 */
export async function getCandidates(): Promise<Candidate[]> {
  try {
    const res = await fetch(`${API_BASE}/candidates`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    if (json.success && Array.isArray(json.data) && json.data.length > 0) {
      return json.data.map(mapBackendCandidate);
    }
    return seedCandidates;
  } catch {
    return seedCandidates;
  }
}

/**
 * Creates a candidate via the backend API.
 */
export async function createCandidateApi(data: Partial<Candidate>): Promise<Candidate> {
  const payload = {
    fullName: data.name,
    email: (data as any).email || `${(data.name || 'candidate').toLowerCase().replace(/[^a-z0-9]/g, '.')}@example.com`,
    education: data.qualification,
    specialization: (data.expertise && data.expertise[0]) || 'Computer Science',
    technicalSkills: data.expertise || [],
    researchAreas: data.researchAreas || [],
    projects: data.projects || [],
    experienceYears: data.experience || 0
  };

  const res = await fetch(`${API_BASE}/candidates`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Failed to create candidate (HTTP ${res.status})`);
  }

  const json = await res.json();
  return mapBackendCandidate(json.data);
}

/**
 * Fetches all interview boards from the backend API.
 */
export async function getBoards(): Promise<InterviewBoard[]> {
  try {
    const res = await fetch(`${API_BASE}/interview-boards`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    if (json.success && Array.isArray(json.data) && json.data.length > 0) {
      return json.data.map(mapBackendBoard);
    }
    return seedBoards;
  } catch {
    return seedBoards;
  }
}

/**
 * Creates an interview board via the backend API.
 */
export async function createBoardApi(data: {
  name: string;
  subject: string;
  description?: string;
  domains: string[];
  candidateIds: string[];
}): Promise<InterviewBoard> {
  const payload = {
    boardTitle: data.name,
    subject: data.subject,
    description: data.description || '',
    requiredExpertise: data.domains,
    candidateIds: data.candidateIds.filter((id) => /^[a-fA-F0-9]{24}$/.test(id)),
    status: 'ready'
  };

  const res = await fetch(`${API_BASE}/interview-boards`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Failed to create board (HTTP ${res.status})`);
  }

  const json = await res.json();
  return mapBackendBoard(json.data);
}

/**
 * Uploads a PDF resume to the backend resume extraction endpoint.
 */
export async function uploadResumeApi(
  file: File,
  kind: 'expert' | 'candidate' = 'expert'
): Promise<{ resumeUrl: string; resumeText: string; extractedProfile: any }> {
  const formData = new FormData();
  formData.append('resume', file);
  formData.append('kind', kind);

  const res = await fetch(`${API_BASE}/resumes/upload`, {
    method: 'POST',
    body: formData
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Upload failed with status ${res.status}`);
  }

  const json = await res.json();
  return json.data;
}

/**
 * Runs the matching algorithm for an interview board.
 */
export async function runBoardMatchingApi(boardId: string): Promise<any> {
  const res = await fetch(`${API_BASE}/matching/boards/${boardId}/run`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({})
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Matching run failed (HTTP ${res.status})`);
  }

  return await res.json();
}

/**
 * Retrieves matching results for an interview board.
 */
export async function getMatchingResultsApi(boardId: string): Promise<any[]> {
  try {
    const res = await fetch(`${API_BASE}/matching/boards/${boardId}/results`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    return json.data || [];
  } catch {
    return [];
  }
}

