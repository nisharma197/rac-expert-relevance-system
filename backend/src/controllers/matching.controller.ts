import { Request, Response } from 'express';
import mongoose from 'mongoose';
import InterviewBoard from '../models/interviewBoard.model';
import Candidate, { ICandidate } from '../models/candidate.model';
import Expert, { IExpert } from '../models/expert.model';
import MatchingResult from '../models/matchingResult.model';
import {
  runBoardMatching,
  DEFAULT_WEIGHTS,
  MatchingWeights
} from '../services/matching.service';

/**
 * Runs the matching algorithm for an interview board against all available experts.
 * POST /api/matching/boards/:boardId/run
 */
export const runMatching = async (req: Request, res: Response): Promise<void> => {
  try {
    const { boardId } = req.params;

    if (!boardId || typeof boardId !== 'string' || !mongoose.Types.ObjectId.isValid(boardId)) {
      res.status(400).json({
        success: false,
        error: 'Bad Request',
        message: `Invalid board ID format: '${boardId}'. Must be a valid 24-character hexadecimal ObjectId.`
      });
      return;
    }

    // 1. Fetch interview board
    const board = await InterviewBoard.findById(boardId);
    if (!board) {
      res.status(404).json({
        success: false,
        error: 'Not Found',
        message: `Interview board with ID '${boardId}' not found`
      });
      return;
    }

    // 2. Fetch selected candidates assigned to this board
    let candidates: ICandidate[] = [];
    if (board.candidateIds && board.candidateIds.length > 0) {
      candidates = await Candidate.find({ _id: { $in: board.candidateIds } });
    }

    // 3. Fetch all active experts
    const experts = await Expert.find();
    if (!experts || experts.length === 0) {
      res.status(400).json({
        success: false,
        error: 'Bad Request',
        message: 'No expert profiles found in the database. Please add experts before running matching.'
      });
      return;
    }

    // 4. Validate or apply custom weights if supplied
    let weights: MatchingWeights = DEFAULT_WEIGHTS;
    if (req.body.weights) {
      const w = req.body.weights;
      if (
        typeof w.boardSubject === 'number' &&
        typeof w.candidateExpertise === 'number' &&
        typeof w.researchRelevance === 'number' &&
        typeof w.experience === 'number' &&
        typeof w.technicalSkills === 'number'
      ) {
        weights = w;
      }
    }

    // 5. Run matching algorithm
    const rankedResults = runBoardMatching(board, candidates, experts, weights);

    // 6. Save or update results in MongoDB
    const savePromises = rankedResults.map(async (item) => {
      return MatchingResult.findOneAndUpdate(
        { boardId: board._id, expertId: item.expertId },
        {
          $set: {
            overallScore: item.overallScore,
            scores: item.scores,
            matchedDomains: item.matchedDomains,
            weakDomains: item.weakDomains,
            explanations: item.explanations,
            status: item.status,
            runDate: new Date()
          }
        },
        { upsert: true, new: true }
      );
    });

    await Promise.all(savePromises);

    res.status(200).json({
      success: true,
      message: `Expert relevance matching executed successfully for board: "${board.boardTitle}"`,
      data: {
        boardId: board._id,
        boardTitle: board.boardTitle,
        subject: board.subject,
        candidatesEvaluated: candidates.length,
        expertsEvaluated: experts.length,
        weightsApplied: weights,
        results: rankedResults
      }
    });
  } catch (error: unknown) {
    console.error('[Matching Controller - runMatching Error]:', error);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: 'An error occurred while executing expert matching analysis'
    });
  }
};

/**
 * Retrieves the stored matching results for an interview board.
 * GET /api/matching/boards/:boardId/results
 */
export const getBoardMatchingResults = async (req: Request, res: Response): Promise<void> => {
  try {
    const { boardId } = req.params;

    if (!boardId || typeof boardId !== 'string' || !mongoose.Types.ObjectId.isValid(boardId)) {
      res.status(400).json({
        success: false,
        error: 'Bad Request',
        message: `Invalid board ID format: '${boardId}'. Must be a valid 24-character hexadecimal ObjectId.`
      });
      return;
    }

    const board = await InterviewBoard.findById(boardId);
    if (!board) {
      res.status(404).json({
        success: false,
        error: 'Not Found',
        message: `Interview board with ID '${boardId}' not found`
      });
      return;
    }

    // Find stored matching results, populated with expert document
    let results = await MatchingResult.find({ boardId })
      .populate('expertId')
      .sort({ overallScore: -1 });

    // If matching hasn't been run yet, run it on demand
    if (!results || results.length === 0) {
      let candidates: ICandidate[] = [];
      if (board.candidateIds && board.candidateIds.length > 0) {
        candidates = await Candidate.find({ _id: { $in: board.candidateIds } });
      }

      const experts = await Expert.find();
      if (experts.length > 0) {
        const rankedResults = runBoardMatching(board, candidates, experts, DEFAULT_WEIGHTS);
        const savePromises = rankedResults.map((item) =>
          MatchingResult.findOneAndUpdate(
            { boardId: board._id, expertId: item.expertId },
            {
              $set: {
                overallScore: item.overallScore,
                scores: item.scores,
                matchedDomains: item.matchedDomains,
                weakDomains: item.weakDomains,
                explanations: item.explanations,
                status: item.status,
                runDate: new Date()
              }
            },
            { upsert: true, new: true }
          )
        );
        await Promise.all(savePromises);

        results = await MatchingResult.find({ boardId })
          .populate('expertId')
          .sort({ overallScore: -1 });
      }
    }

    res.status(200).json({
      success: true,
      count: results.length,
      data: results
    });
  } catch (error: unknown) {
    console.error('[Matching Controller - getBoardMatchingResults Error]:', error);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: 'An error occurred while retrieving matching results'
    });
  }
};

/**
 * Retrieves matching explanation and score breakdown for a specific expert on a specific board.
 * GET /api/matching/boards/:boardId/results/:expertId
 */
export const getBoardExpertMatchDetail = async (req: Request, res: Response): Promise<void> => {
  try {
    const { boardId, expertId } = req.params;

    if (!boardId || typeof boardId !== 'string' || !mongoose.Types.ObjectId.isValid(boardId)) {
      res.status(400).json({
        success: false,
        error: 'Bad Request',
        message: `Invalid board ID format: '${boardId}'`
      });
      return;
    }

    if (!expertId || typeof expertId !== 'string' || !mongoose.Types.ObjectId.isValid(expertId)) {
      res.status(400).json({
        success: false,
        error: 'Bad Request',
        message: `Invalid expert ID format: '${expertId}'`
      });
      return;
    }

    const result = await MatchingResult.findOne({ boardId, expertId })
      .populate('expertId')
      .populate('boardId');

    if (!result) {
      res.status(404).json({
        success: false,
        error: 'Not Found',
        message: `Matching analysis not found for board '${boardId}' and expert '${expertId}'`
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error: unknown) {
    console.error('[Matching Controller - getBoardExpertMatchDetail Error]:', error);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: 'An error occurred while retrieving expert match analysis'
    });
  }
};

/**
 * Allows the administrator to update the advisory status of an expert for a board.
 * PUT /api/matching/boards/:boardId/results/:expertId/status
 */
export const updateMatchingStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { boardId, expertId } = req.params;

    if (!boardId || typeof boardId !== 'string' || !mongoose.Types.ObjectId.isValid(boardId)) {
      res.status(400).json({
        success: false,
        error: 'Bad Request',
        message: `Invalid board ID format: '${boardId}'`
      });
      return;
    }

    if (!expertId || typeof expertId !== 'string' || !mongoose.Types.ObjectId.isValid(expertId)) {
      res.status(400).json({
        success: false,
        error: 'Bad Request',
        message: `Invalid expert ID format: '${expertId}'`
      });
      return;
    }

    const { status } = req.body;

    const allowed = ['Recommended', 'Shortlisted', 'Under Review', 'Selected'];
    if (!allowed.includes(status)) {
      res.status(400).json({
        success: false,
        error: 'Bad Request',
        message: `Invalid status '${status}'. Must be one of: ${allowed.join(', ')}`
      });
      return;
    }

    const updated = await MatchingResult.findOneAndUpdate(
      { boardId, expertId },
      { $set: { status } },
      { new: true }
    );

    if (!updated) {
      res.status(404).json({
        success: false,
        error: 'Not Found',
        message: `Matching result for board '${boardId}' and expert '${expertId}' not found`
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: `Expert advisory status updated to "${status}"`,
      data: updated
    });
  } catch (error: unknown) {
    console.error('[Matching Controller - updateMatchingStatus Error]:', error);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: 'An error occurred while updating matching status'
    });
  }
};
