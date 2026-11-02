import { Router } from 'express';
import {
  createCandidate,
  getAllCandidates,
  getCandidateById,
  updateCandidate,
  deleteCandidate
} from '../controllers/candidate.controller';
import {
  validateObjectId,
  validateCreateCandidate,
  validateUpdateCandidate
} from '../middleware/validate';

const router: Router = Router();

// POST /api/candidates - Create candidate
router.post('/', validateCreateCandidate, createCandidate);

// GET /api/candidates - Get all candidates
router.get('/', getAllCandidates);

// GET /api/candidates/:id - Get candidate by ID
router.get('/:id', validateObjectId, getCandidateById);

// PUT /api/candidates/:id - Update candidate
router.put('/:id', validateObjectId, validateUpdateCandidate, updateCandidate);

// DELETE /api/candidates/:id - Delete candidate
router.delete('/:id', validateObjectId, deleteCandidate);

export default router;

