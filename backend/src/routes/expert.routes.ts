import { Router } from 'express';
import {
  createExpert,
  getAllExperts,
  getExpertById,
  updateExpert,
  deleteExpert
} from '../controllers/expert.controller';
import {
  validateObjectId,
  validateCreateExpert,
  validateUpdateExpert
} from '../middleware/validate';

const router: Router = Router();

// POST /api/experts - Create an expert
router.post('/', validateCreateExpert, createExpert);

// GET /api/experts - Get all experts
router.get('/', getAllExperts);

// GET /api/experts/:id - Get one expert by ID
router.get('/:id', validateObjectId, getExpertById);

// PUT /api/experts/:id - Update an expert
router.put('/:id', validateObjectId, validateUpdateExpert, updateExpert);

// DELETE /api/experts/:id - Delete an expert
router.delete('/:id', validateObjectId, deleteExpert);

export default router;

