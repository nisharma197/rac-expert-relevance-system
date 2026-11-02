import { Router } from 'express';
import { resumeUpload } from '../middleware/upload';
import {
  uploadAndExtractResume,
  uploadExpertResume,
  uploadCandidateResume
} from '../controllers/resume.controller';

const router: Router = Router();

// POST /api/resumes/upload - General resume upload and extraction
router.post('/upload', resumeUpload.single('resume'), uploadAndExtractResume);

// POST /api/resumes/expert/:id - Upload and attach to expert
router.post('/expert/:id', resumeUpload.single('resume'), uploadExpertResume);

// POST /api/resumes/candidate/:id - Upload and attach to candidate
router.post('/candidate/:id', resumeUpload.single('resume'), uploadCandidateResume);

export default router;

