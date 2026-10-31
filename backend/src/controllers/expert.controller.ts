import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Expert from '../models/expert.model';

/**
 * Creates a new expert record.
 * POST /api/experts
 */
export const createExpert = async (req: Request, res: Response): Promise<void> => {
  try {
    const expert = await Expert.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Expert created successfully',
      data: expert
    });
  } catch (error: unknown) {
    // Duplicate email error (MongoDB code 11000)
    if ((error as { code?: number })?.code === 11000) {
      res.status(409).json({
        success: false,
        error: 'Conflict',
        message: 'An expert with this email already exists'
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

    console.error('[Expert Controller - createExpert Error]:', error);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: 'An unexpected error occurred while processing your request'
    });
  }
};

/**
 * Retrieves all experts.
 * GET /api/experts
 */
export const getAllExperts = async (_req: Request, res: Response): Promise<void> => {
  try {
    const experts = await Expert.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: experts.length,
      data: experts
    });
  } catch (error: unknown) {
    console.error('[Expert Controller - getAllExperts Error]:', error);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: 'An unexpected error occurred while processing your request'
    });
  }
};

/**
 * Retrieves a single expert by MongoDB ObjectId.
 * GET /api/experts/:id
 */
export const getExpertById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const expert = await Expert.findById(id);

    if (!expert) {
      res.status(404).json({
        success: false,
        error: 'Not Found',
        message: `Expert with ID '${id}' not found`
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: expert
    });
  } catch (error: unknown) {
    console.error('[Expert Controller - getExpertById Error]:', error);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: 'An unexpected error occurred while processing your request'
    });
  }
};

/**
 * Updates an existing expert by MongoDB ObjectId.
 * PUT /api/experts/:id
 */
export const updateExpert = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    // Prevent overriding immutable metadata fields
    const { _id, createdAt, updatedAt, ...updateData } = req.body;

    const updatedExpert = await Expert.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!updatedExpert) {
      res.status(404).json({
        success: false,
        error: 'Not Found',
        message: `Expert with ID '${id}' not found`
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Expert updated successfully',
      data: updatedExpert
    });
  } catch (error: unknown) {
    // Duplicate email error on update (MongoDB code 11000)
    if ((error as { code?: number })?.code === 11000) {
      res.status(409).json({
        success: false,
        error: 'Conflict',
        message: 'An expert with this email already exists'
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

    console.error('[Expert Controller - updateExpert Error]:', error);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: 'An unexpected error occurred while processing your request'
    });
  }
};

/**
 * Deletes an expert by MongoDB ObjectId.
 * DELETE /api/experts/:id
 */
export const deleteExpert = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const deletedExpert = await Expert.findByIdAndDelete(id);

    if (!deletedExpert) {
      res.status(404).json({
        success: false,
        error: 'Not Found',
        message: `Expert with ID '${id}' not found`
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Expert deleted successfully',
      data: {
        id: deletedExpert._id
      }
    });
  } catch (error: unknown) {
    console.error('[Expert Controller - deleteExpert Error]:', error);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: 'An unexpected error occurred while processing your request'
    });
  }
};

