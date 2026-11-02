import { Request, Response } from 'express';
import mongoose from 'mongoose';
import path from 'path';
import { parseResumePdf } from '../services/resumeParser.service';
import Expert from '../models/expert.model';
import Candidate from '../models/candidate.model';

/**
 * Uploads a resume and extracts text and structured attributes without binding to an ID yet.
 * POST /api/resumes/upload
 */
export const uploadAndExtractResume = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({
        success: false,
        error: 'Bad Request',
        message: 'No PDF file uploaded. Please supply a valid resume file in the "resume" field.'
      });
      return;
    }

    const kind = (req.body.kind || req.query.kind || 'expert') as 'expert' | 'candidate';
    const filePath = path.resolve(req.file.path);

    const parseResult = await parseResumePdf(filePath, kind);

    if (!parseResult.success) {
      res.status(422).json({
        success: false,
        error: 'Unprocessable Entity',
        message: parseResult.error || 'Failed to extract text from PDF resume',
        data: {
          resumeUrl: `/uploads/resumes/${req.file.filename}`
        }
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Resume uploaded and processed successfully',
      data: {
        resumeUrl: `/uploads/resumes/${req.file.filename}`,
        resumeText: parseResult.rawText || '',
        extractedProfile: parseResult.data || {}
      }
    });
  } catch (error: unknown) {
    console.error('[Resume Controller - uploadAndExtractResume Error]:', error);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: 'An error occurred while processing the uploaded resume'
    });
  }
};

/**
 * Uploads, extracts, and attaches a resume to an existing Expert.
 * POST /api/experts/:id/resume
 */
export const uploadExpertResume = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id || typeof id !== 'string' || !mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        error: 'Bad Request',
        message: `Invalid expert ID format: '${id}'. Must be a valid 24-character hexadecimal ObjectId.`
      });
      return;
    }

    if (!req.file) {
      res.status(400).json({
        success: false,
        error: 'Bad Request',
        message: 'No PDF file uploaded. Please supply a valid resume file in the "resume" field.'
      });
      return;
    }

    const expert = await Expert.findById(id);
    if (!expert) {
      res.status(404).json({
        success: false,
        error: 'Not Found',
        message: `Expert with ID '${id}' not found`
      });
      return;
    }

    const filePath = path.resolve(req.file.path);
    const parseResult = await parseResumePdf(filePath, 'expert');

    const resumeUrl = `/uploads/resumes/${req.file.filename}`;
    const resumeText = parseResult.rawText || '';

    // Update expert document with resume details
    expert.resumeUrl = resumeUrl;
    expert.resumeText = resumeText;
    await expert.save();

    res.status(200).json({
      success: true,
      message: 'Expert resume uploaded and extracted successfully',
      data: {
        expert,
        extractedProfile: parseResult.data || {}
      }
    });
  } catch (error: unknown) {
    console.error('[Resume Controller - uploadExpertResume Error]:', error);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: 'An error occurred while processing the expert resume'
    });
  }
};

/**
 * Uploads, extracts, and attaches a resume to an existing Candidate.
 * POST /api/candidates/:id/resume
 */
export const uploadCandidateResume = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id || typeof id !== 'string' || !mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        error: 'Bad Request',
        message: `Invalid candidate ID format: '${id}'. Must be a valid 24-character hexadecimal ObjectId.`
      });
      return;
    }

    if (!req.file) {
      res.status(400).json({
        success: false,
        error: 'Bad Request',
        message: 'No PDF file uploaded. Please supply a valid resume file in the "resume" field.'
      });
      return;
    }

    const candidate = await Candidate.findById(id);
    if (!candidate) {
      res.status(404).json({
        success: false,
        error: 'Not Found',
        message: `Candidate with ID '${id}' not found`
      });
      return;
    }

    const filePath = path.resolve(req.file.path);
    const parseResult = await parseResumePdf(filePath, 'candidate');

    const resumeUrl = `/uploads/resumes/${req.file.filename}`;
    const resumeText = parseResult.rawText || '';

    // Update candidate document with resume details
    candidate.resumeUrl = resumeUrl;
    candidate.resumeText = resumeText;
    await candidate.save();

    res.status(200).json({
      success: true,
      message: 'Candidate resume uploaded and extracted successfully',
      data: {
        candidate,
        extractedProfile: parseResult.data || {}
      }
    });
  } catch (error: unknown) {
    console.error('[Resume Controller - uploadCandidateResume Error]:', error);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: 'An error occurred while processing the candidate resume'
    });
  }
};

