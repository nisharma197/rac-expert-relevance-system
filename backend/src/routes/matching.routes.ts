import { Router } from 'express';
import {
  runMatching,
  getBoardMatchingResults,
  getBoardExpertMatchDetail,
  updateMatchingStatus
} from '../controllers/matching.controller';

const router: Router = Router();

// POST /api/matching/boards/:boardId/run - Execute matching algorithm
router.post('/boards/:boardId/run', runMatching);

// GET /api/matching/boards/:boardId/results - Retrieve ranked results for board
router.get('/boards/:boardId/results', getBoardMatchingResults);

// GET /api/matching/boards/:boardId/results/:expertId - Retrieve match explanation for specific expert
router.get('/boards/:boardId/results/:expertId', getBoardExpertMatchDetail);

// PUT /api/matching/boards/:boardId/results/:expertId/status - Update advisory status
router.put('/boards/:boardId/results/:expertId/status', updateMatchingStatus);

export default router;

