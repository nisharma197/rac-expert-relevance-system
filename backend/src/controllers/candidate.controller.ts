import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Candidate from '../models/candidate.model';

/**
 * Creates a new candidate record.
 * POST /api/candidates
 */
export const createCandidate = async (req: Request, res: Response): Promise<void> => {
  try {
    const candidate = await Candidate.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Candidate created successfully',
      data: candidate
    });
  } catch (error: unknown) {
    // Duplicate email error (MongoDB code 11000)
    if ((error as { code?: number })?.code === 11000) {
      res.status(409).json({
        success: false,
        error: 'Conflict',
        message: 'A candidate with this email already exists'
      });
      return;
    }

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

    console.error('[Candidate Controller - createCandidate Error]:', error);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: 'An unexpected error occurred while processing your request'
    });
  }
};

/**
 * Retrieves all candidates.
 * GET /api/candidates
 */
export const getAllCandidates = async (_req: Request, res: Response): Promise<void> => {
  try {
    const candidates = await Candidate.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: candidates.length,
      data: candidates
    });
  } catch (error: unknown) {
    console.error('[Candidate Controller - getAllCandidates Error]:', error);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: 'An unexpected error occurred while processing your request'
    });
  }
};

/**
 * Retrieves a single candidate by MongoDB ObjectId.
 * GET /api/candidates/:id
 */
export const getCandidateById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const candidate = await Candidate.findById(id);

    if (!candidate) {
      res.status(404).json({
        success: false,
        error: 'Not Found',
        message: `Candidate with ID '${id}' not found`
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: candidate
    });
  } catch (error: unknown) {
    console.error('[Candidate Controller - getCandidateById Error]:', error);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: 'An unexpected error occurred while processing your request'
    });
  }
};

/**
 * Updates an existing candidate by MongoDB ObjectId.
 * PUT /api/candidates/:id
 */
export const updateCandidate = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    // Prevent overriding immutable metadata fields
    const { _id, createdAt, updatedAt, ...updateData } = req.body;

    const updatedCandidate = await Candidate.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!updatedCandidate) {
      res.status(404).json({
        success: false,
        error: 'Not Found',
        message: `Candidate with ID '${id}' not found`
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Candidate updated successfully',
      data: updatedCandidate
    });
  } catch (error: unknown) {
    // Duplicate email error on update (MongoDB code 11000)
    if ((error as { code?: number })?.code === 11000) {
      res.status(409).json({
        success: false,
        error: 'Conflict',
        message: 'A candidate with this email already exists'
      });
      return;
    }

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

    console.error('[Candidate Controller - updateCandidate Error]:', error);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: 'An unexpected error occurred while processing your request'
    });
  }
};

/**
 * Deletes a candidate by MongoDB ObjectId.
 * DELETE /api/candidates/:id
 */
export const deleteCandidate = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const deletedCandidate = await Candidate.findByIdAndDelete(id);

    if (!deletedCandidate) {
      res.status(404).json({
        success: false,
        error: 'Not Found',
        message: `Candidate with ID '${id}' not found`
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Candidate deleted successfully',
      data: {
        id: deletedCandidate._id
      }
    });
  } catch (error: unknown) {
    console.error('[Candidate Controller - deleteCandidate Error]:', error);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: 'An unexpected error occurred while processing your request'
    });
  }
};

