import { IExpert } from '../models/expert.model';
import { ICandidate } from '../models/candidate.model';
import { IInterviewBoard } from '../models/interviewBoard.model';

export interface MatchingWeights {
  boardSubject: number;
  candidateExpertise: number;
  researchRelevance: number;
  experience: number;
  technicalSkills: number;
}

export const DEFAULT_WEIGHTS: MatchingWeights = {
  boardSubject: 0.30,
  candidateExpertise: 0.30,
  researchRelevance: 0.20,
  experience: 0.10,
  technicalSkills: 0.10
};

export interface ScoredExpertResult {
  expertId: string;
  expert: IExpert;
  overallScore: number;
  scores: {
    boardSubject: number;
    candidateExpertise: number;
    researchRelevance: number;
    experience: number;
    technicalSkills: number;
  };
  matchedDomains: string[];
  weakDomains: string[];
  explanations: string[];
  status: 'Recommended' | 'Shortlisted' | 'Under Review' | 'Selected';
}

// Stop words to ignore during tokenization
const STOP_WORDS = new Set([
  'and', 'or', 'the', 'in', 'of', 'for', 'with', 'a', 'an', 'on', 'at',
  'to', 'by', 'as', 'is', 'are', 'system', 'systems', 'based', 'technology'
]);

// Domain synonyms and abbreviations
const SYNONYM_MAP: Record<string, string[]> = {
  ai: ['artificial intelligence', 'machine learning', 'deep learning'],
  'artificial intelligence': ['ai', 'machine learning', 'deep learning'],
  ml: ['machine learning', 'deep learning', 'artificial intelligence'],
  'machine learning': ['ml', 'deep learning', 'artificial intelligence'],
  dl: ['deep learning', 'neural networks'],
  'deep learning': ['dl', 'neural networks', 'machine learning'],
  cv: ['computer vision', 'image processing', 'perception'],
  'computer vision': ['cv', 'image processing', 'perception', 'visual'],
  nlp: ['natural language processing', 'language models', 'transformers'],
  'natural language processing': ['nlp', 'language models', 'text processing'],
  robotics: ['autonomous systems', 'ros', 'ros2', 'control systems'],
  'autonomous systems': ['robotics', 'unmanned', 'uav', 'ugv', 'navigation'],
  uav: ['unmanned aerial vehicle', 'drone', 'autonomous systems'],
  radar: ['radar systems', 'signal processing', 'rf systems'],
  cyber: ['cyber security', 'cryptography', 'network security', 'information security'],
  'cyber security': ['cyber', 'information security', 'network security', 'threat detection']
};

/**
 * Normalizes text: trims, lowercases, removes punctuation.
 */
export const normalizeText = (text: string): string => {
  return (text || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

/**
 * Tokenizes text into a set of clean words, excluding stop words.
 */
export const tokenize = (text: string): Set<string> => {
  const norm = normalizeText(text);
  const words = norm.split(' ').filter((w) => w.length > 1 && !STOP_WORDS.has(w));
  return new Set(words);
};

/**
 * Checks if two domain terms match via exact match, substring, or known domain synonyms.
 */
export const termsMatch = (termA: string, termB: string): boolean => {
  const a = normalizeText(termA);
  const b = normalizeText(termB);

  if (!a || !b) return false;
  if (a === b || a.includes(b) || b.includes(a)) return true;

  // Check synonym mappings
  const synsA = SYNONYM_MAP[a] || [];
  if (synsA.some((s) => s === b || b.includes(s) || s.includes(b))) return true;

  const synsB = SYNONYM_MAP[b] || [];
  if (synsB.some((s) => s === a || a.includes(s) || s.includes(a))) return true;

  // Token overlap check
  const tokA = tokenize(a);
  const tokB = tokenize(b);
  let overlap = 0;
  for (const t of tokA) {
    if (tokB.has(t)) overlap++;
  }

  return overlap > 0 && overlap / Math.min(tokA.size, tokB.size) >= 0.5;
};

/**
 * Computes overlap score (0 to 100) and matched terms between two lists of items.
 */
export const computeListOverlap = (
  sourceItems: string[],
  targetItems: string[]
): { score: number; matched: string[]; missing: string[] } => {
  if (!targetItems || targetItems.length === 0) {
    return { score: 75, matched: [], missing: [] };
  }

  if (!sourceItems || sourceItems.length === 0) {
    return { score: 0, matched: [], missing: [...targetItems] };
  }

  const matched = new Set<string>();
  const missing: string[] = [];

  for (const target of targetItems) {
    let found = false;
    for (const source of sourceItems) {
      if (termsMatch(source, target)) {
        matched.add(target);
        found = true;
        break;
      }
    }
    if (!found) {
      missing.push(target);
    }
  }

  const score = Math.round((matched.size / targetItems.length) * 100);
  return { score: Math.min(100, Math.max(0, score)), matched: Array.from(matched), missing };
};

/**
 * Evaluates Board Subject relevance score (0 - 100).
 */
const calculateBoardSubjectScore = (
  expert: IExpert,
  board: IInterviewBoard
): { score: number; matched: string[]; weak: string[] } => {
  const boardTargets = [
    board.subject,
    ...(board.requiredExpertise || [])
  ].filter(Boolean);

  const expertCapabilities = [
    expert.specialization || '',
    ...(expert.researchAreas || []),
    ...(expert.technicalSkills || []),
    ...(expert.projects || [])
  ].filter(Boolean);

  // Exact match with subject gets bonus baseline
  let subjectBonus = 0;
  if (expert.specialization && termsMatch(expert.specialization, board.subject)) {
    subjectBonus += 25;
  }
  if ((expert.researchAreas || []).some((r) => termsMatch(r, board.subject))) {
    subjectBonus += 20;
  }

  const { score: overlapScore, matched, missing } = computeListOverlap(expertCapabilities, boardTargets);
  const finalScore = Math.min(100, Math.round(overlapScore * 0.7 + subjectBonus));

  return { score: finalScore, matched, weak: missing };
};

/**
 * Evaluates Candidate Expertise relevance score (0 - 100) using the combined candidate pool.
 */
const calculateCandidateExpertiseScore = (
  expert: IExpert,
  candidates: ICandidate[],
  board: IInterviewBoard
): { score: number; matched: string[]; weak: string[] } => {
  if (!candidates || candidates.length === 0) {
    // Fall back gracefully to board's required expertise if no candidates are attached yet
    return calculateBoardSubjectScore(expert, board);
  }

  // Aggregate candidate pool expertise
  const candidatePoolTerms = new Set<string>();
  candidates.forEach((cand) => {
    (cand.technicalSkills || []).forEach((s) => candidatePoolTerms.add(s));
    (cand.researchAreas || []).forEach((r) => candidatePoolTerms.add(r));
    if (cand.specialization) candidatePoolTerms.add(cand.specialization);
  });

  const candidateTargets = Array.from(candidatePoolTerms);
  const expertProfile = [
    expert.specialization || '',
    ...(expert.technicalSkills || []),
    ...(expert.researchAreas || []),
    ...(expert.projects || [])
  ];

  const { score, matched, missing } = computeListOverlap(expertProfile, candidateTargets);
  return { score, matched, weak: missing };
};

/**
 * Evaluates Research & Domain Relevance score (0 - 100).
 */
const calculateResearchRelevanceScore = (
  expert: IExpert,
  board: IInterviewBoard,
  candidates: ICandidate[]
): number => {
  const targetResearchDomains = new Set<string>();
  (board.requiredExpertise || []).forEach((e) => targetResearchDomains.add(e));
  targetResearchDomains.add(board.subject);

  candidates.forEach((cand) => {
    (cand.researchAreas || []).forEach((r) => targetResearchDomains.add(r));
  });

  const expertResearch = [
    ...(expert.researchAreas || []),
    ...(expert.publications || [])
  ];

  const { score } = computeListOverlap(expertResearch, Array.from(targetResearchDomains));

  // Publication volume contribution (max 15 points bonus)
  const pubCount = (expert.publications || []).length;
  const pubBonus = Math.min(15, pubCount * 3);

  return Math.min(100, score + pubBonus);
};

/**
 * Evaluates Experience & Qualification score (0 - 100).
 */
const calculateExperienceScore = (expert: IExpert): number => {
  const years = expert.experienceYears || 0;
  let baseScore = 50;

  if (years >= 18) {
    baseScore = 95;
  } else if (years >= 14) {
    baseScore = 90;
  } else if (years >= 10) {
    baseScore = 82;
  } else if (years >= 6) {
    baseScore = 74;
  } else if (years >= 3) {
    baseScore = 65;
  } else if (years > 0) {
    baseScore = 55;
  }

  // Qualification boost
  const edu = (expert.education || '').toLowerCase();
  if (edu.includes('ph.d') || edu.includes('phd') || edu.includes('doctor')) {
    baseScore = Math.min(100, baseScore + 8);
  } else if (edu.includes('m.tech') || edu.includes('m.e') || edu.includes('master')) {
    baseScore = Math.min(100, baseScore + 4);
  }

  return baseScore;
};

/**
 * Evaluates Technical Skills relevance score (0 - 100).
 */
const calculateTechnicalSkillsScore = (
  expert: IExpert,
  board: IInterviewBoard,
  candidates: ICandidate[]
): { score: number; matched: string[] } => {
  const targetSkills = new Set<string>();
  (board.requiredExpertise || []).forEach((s) => targetSkills.add(s));

  candidates.forEach((cand) => {
    (cand.technicalSkills || []).forEach((s) => targetSkills.add(s));
  });

  const { score, matched } = computeListOverlap(
    expert.technicalSkills || [],
    Array.from(targetSkills)
  );

  return { score, matched };
};

/**
 * Evaluates a single expert against an interview board and its candidates.
 */
export const scoreExpertForBoard = (
  expert: IExpert,
  board: IInterviewBoard,
  candidates: ICandidate[],
  weights: MatchingWeights = DEFAULT_WEIGHTS
): ScoredExpertResult => {
  // 1. Board Subject Score (30%)
  const boardSubj = calculateBoardSubjectScore(expert, board);

  // 2. Candidate Expertise Score (30%)
  const candExp = calculateCandidateExpertiseScore(expert, candidates, board);

  // 3. Research Relevance Score (20%)
  const resRel = calculateResearchRelevanceScore(expert, board, candidates);

  // 4. Experience Score (10%)
  const expScore = calculateExperienceScore(expert);

  // 5. Technical Skills Score (10%)
  const techSkills = calculateTechnicalSkillsScore(expert, board, candidates);

  // Weighted Final Score
  const rawScore =
    weights.boardSubject * boardSubj.score +
    weights.candidateExpertise * candExp.score +
    weights.researchRelevance * resRel +
    weights.experience * expScore +
    weights.technicalSkills * techSkills.score;

  const overallScore = Math.round(rawScore * 10) / 10;

  // Compile matched and weak domain sets
  const allMatched = Array.from(new Set([
    ...boardSubj.matched,
    ...candExp.matched,
    ...techSkills.matched
  ]));

  const allWeak = Array.from(new Set([
    ...boardSubj.weak,
    ...candExp.weak
  ])).filter((d) => !allMatched.some((m) => termsMatch(m, d)));

  // Generate transparent explanations
  const explanations: string[] = [];

  if (boardSubj.score >= 80) {
    explanations.push(`Strong alignment with interview board subject: "${board.subject}"`);
  } else if (boardSubj.score >= 60) {
    explanations.push(`Moderate domain overlap with board subject: "${board.subject}"`);
  } else {
    explanations.push(`Limited direct alignment with board subject: "${board.subject}"`);
  }

  if (candidates.length > 0) {
    if (candExp.score >= 75) {
      explanations.push(`High expertise overlap with candidate pool (${candidates.length} candidate profiles analyzed)`);
    } else {
      explanations.push(`Partial coverage of candidate pool requirements`);
    }
  }

  if (allMatched.length > 0) {
    explanations.push(`Verified evidence across: ${allMatched.slice(0, 4).join(', ')}`);
  }

  const expYears = expert.experienceYears || 0;
  if (expYears >= 10) {
    explanations.push(`${expYears} years of professional and research experience`);
  }

  if (allWeak.length > 0) {
    explanations.push(`Limited evidence found in: ${allWeak.slice(0, 3).join(', ')}`);
  }

  // Determine advisory recommendation status (decision remains with admin)
  let status: 'Recommended' | 'Shortlisted' | 'Under Review' = 'Under Review';
  if (overallScore >= 85) {
    status = 'Recommended';
  } else if (overallScore >= 70) {
    status = 'Shortlisted';
  }

  return {
    expertId: (expert as unknown as { _id: { toString(): string } })._id?.toString() || '',
    expert,
    overallScore,
    scores: {
      boardSubject: boardSubj.score,
      candidateExpertise: candExp.score,
      researchRelevance: resRel,
      experience: expScore,
      technicalSkills: techSkills.score
    },
    matchedDomains: allMatched,
    weakDomains: allWeak,
    explanations,
    status
  };
};

/**
 * Runs the matching engine across all available experts for a given board and candidate set.
 * Returns results ranked in descending order by overall score.
 */
export const runBoardMatching = (
  board: IInterviewBoard,
  candidates: ICandidate[],
  experts: IExpert[],
  weights: MatchingWeights = DEFAULT_WEIGHTS
): ScoredExpertResult[] => {
  const scored = experts.map((expert) =>
    scoreExpertForBoard(expert, board, candidates, weights)
  );

  // Rank experts from highest to lowest score
  scored.sort((a, b) => b.overallScore - a.overallScore);

  return scored;
};
