import { Request, Response } from 'express';
import mongoose from 'mongoose';
import InterviewBoard from '../models/interviewBoard.model';
import Candidate from '../models/candidate.model';

/**
 * Helper function to validate an array of candidate IDs:
 * 1. Confirms it is an Array.
 * 2. Confirms every item is a valid 24-hex ObjectId.
 * 3. Confirms every referenced Candidate exists in MongoDB.
 * Returns null if valid, or an error message string if invalid.
 */
const validateCandidateIds = async (candidateIds: unknown): Promise<string | null> => {
  if (!Array.isArray(candidateIds)) {
    return 'candidateIds must be an array of MongoDB ObjectIds';
  }

  for (const cid of candidateIds) {
    if (
      !cid ||
      (typeof cid !== 'string' && !(cid instanceof mongoose.Types.ObjectId)) ||
      !mongoose.Types.ObjectId.isValid(cid)
    ) {
      return `Invalid candidate ID format: '${cid}'. Must be a valid 24-character hexadecimal ObjectId.`;
    }
  }

  if (candidateIds.length > 0) {
    const uniqueIds = [...new Set(candidateIds.map((id) => id.toString()))];
    const existingCandidates = await Candidate.find({ _id: { $in: uniqueIds } }).select('_id');
    const existingIdSet = new Set(existingCandidates.map((c) => c._id.toString()));
    const missingIds = uniqueIds.filter((id) => !existingIdSet.has(id));

    if (missingIds.length > 0) {
      return `The following candidate IDs do not exist: ${missingIds.join(', ')}`;
    }
  }

  return null;
};

/**
 * Creates a new interview board.
 * POST /api/interview-boards
 */
export const createInterviewBoard = async (req: Request, res: Response): Promise<void> => {
  try {
    const { candidateIds } = req.body;

    // Validate candidate references if supplied
    if (candidateIds !== undefined) {
      const candidateError = await validateCandidateIds(candidateIds);
      if (candidateError) {
        res.status(400).json({
          success: false,
          error: 'Bad Request',
          message: candidateError
        });
        return;
      }
    }

    const board = await InterviewBoard.create(req.body);
    const populatedBoard = await board.populate('candidateIds');

    res.status(201).json({
      success: true,
      message: 'Interview board created successfully',
      data: populatedBoard
    });
  } catch (error: unknown) {
    // Mongoose schema validation error
    if (error instanceof mongoose.Error.ValidationError) {
      const messages = Object.values(error.errors).map((err) => err.message);
      res.status(400).json({
        success: false,
        error: 'Validation Error',
        message: messages.join(', ')
      });
      return;
    }

    console.error('[InterviewBoard Controller - createInterviewBoard Error]:', error);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: 'An unexpected error occurred while processing your request'
    });
  }
};

/**
 * Retrieves all interview boards with populated candidate details.
 * GET /api/interview-boards
 */
export const getAllInterviewBoards = async (_req: Request, res: Response): Promise<void> => {
  try {
    const boards = await InterviewBoard.find()
      .populate('candidateIds')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: boards.length,
      data: boards
    });
  } catch (error: unknown) {
    console.error('[InterviewBoard Controller - getAllInterviewBoards Error]:', error);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: 'An unexpected error occurred while processing your request'
    });
  }
};

/**
 * Retrieves a single interview board by MongoDB ObjectId with populated candidate details.
 * GET /api/interview-boards/:id
 */
export const getInterviewBoardById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id || typeof id !== 'string' || !mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        error: 'Bad Request',
        message: `Invalid interview board ID format: '${id}'. Must be a valid 24-character hexadecimal ObjectId.`
      });
      return;
    }

    const board = await InterviewBoard.findById(id).populate('candidateIds');

    if (!board) {
      res.status(404).json({
        success: false,
        error: 'Not Found',
        message: `Interview board with ID '${id}' not found`
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: board
    });
  } catch (error: unknown) {
    console.error('[InterviewBoard Controller - getInterviewBoardById Error]:', error);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: 'An unexpected error occurred while processing your request'
    });
  }
};

/**
 * Updates an existing interview board by MongoDB ObjectId.
 * PUT /api/interview-boards/:id
 */
export const updateInterviewBoard = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id || typeof id !== 'string' || !mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        error: 'Bad Request',
        message: `Invalid interview board ID format: '${id}'. Must be a valid 24-character hexadecimal ObjectId.`
      });
      return;
    }

    // Prevent overriding immutable metadata fields
    const { _id, createdAt, updatedAt, ...updateData } = req.body;

    // Validate candidate references if supplied
    if (updateData.candidateIds !== undefined) {
      const candidateError = await validateCandidateIds(updateData.candidateIds);
      if (candidateError) {
        res.status(400).json({
          success: false,
          error: 'Bad Request',
          message: candidateError
        });
        return;
      }
    }

    const updatedBoard = await InterviewBoard.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).populate('candidateIds');

    if (!updatedBoard) {
      res.status(404).json({
        success: false,
        error: 'Not Found',
        message: `Interview board with ID '${id}' not found`
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Interview board updated successfully',
      data: updatedBoard
    });
  } catch (error: unknown) {
    // Mongoose schema validation error
    if (error instanceof mongoose.Error.ValidationError) {
      const messages = Object.values(error.errors).map((err) => err.message);
      res.status(400).json({
        success: false,
        error: 'Validation Error',
        message: messages.join(', ')
      });
      return;
    }

    console.error('[InterviewBoard Controller - updateInterviewBoard Error]:', error);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: 'An unexpected error occurred while processing your request'
    });
  }
};

/**
 * Deletes an interview board by MongoDB ObjectId.
 * DELETE /api/interview-boards/:id
 */
export const deleteInterviewBoard = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id || typeof id !== 'string' || !mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        error: 'Bad Request',
        message: `Invalid interview board ID format: '${id}'. Must be a valid 24-character hexadecimal ObjectId.`
      });
      return;
    }

    const deletedBoard = await InterviewBoard.findByIdAndDelete(id);

    if (!deletedBoard) {
      res.status(404).json({
        success: false,
        error: 'Not Found',
        message: `Interview board with ID '${id}' not found`
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Interview board deleted successfully',
      data: {
        id: deletedBoard._id
      }
    });
  } catch (error: unknown) {
    console.error('[InterviewBoard Controller - deleteInterviewBoard Error]:', error);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: 'An unexpected error occurred while processing your request'
    });
  }
};

