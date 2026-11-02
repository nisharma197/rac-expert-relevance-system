import { Router } from 'express';
import {
  createInterviewBoard,
  getAllInterviewBoards,
  getInterviewBoardById,
  updateInterviewBoard,
  deleteInterviewBoard
} from '../controllers/interviewBoard.controller';
import { validateObjectId } from '../middleware/validate';

const router: Router = Router();

// POST /api/interview-boards - Create interview board
router.post('/', createInterviewBoard);

// GET /api/interview-boards - Get all interview boards
router.get('/', getAllInterviewBoards);

// GET /api/interview-boards/:id - Get interview board by ID
router.get('/:id', validateObjectId, getInterviewBoardById);

// PUT /api/interview-boards/:id - Update interview board
router.put('/:id', validateObjectId, updateInterviewBoard);

// DELETE /api/interview-boards/:id - Delete interview board
router.delete('/:id', validateObjectId, deleteInterviewBoard);

export default router;

