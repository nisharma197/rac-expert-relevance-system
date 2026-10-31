import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Validates that the :id route parameter is a valid 24-character hexadecimal MongoDB ObjectId.
 */
export const validateObjectId = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { id } = req.params;

  if (!id || typeof id !== 'string' || !mongoose.Types.ObjectId.isValid(id)) {
    res.status(400).json({
      success: false,
      error: 'Bad Request',
      message: `Invalid expert ID format: '${id}'. Must be a valid 24-character hexadecimal ObjectId.`
    });
    return;
  }

  next();
};

/**
 * Validates the request body for creating a new Expert.
 */
export const validateCreateExpert = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (!req.body || typeof req.body !== 'object') {
    res.status(400).json({
      success: false,
      error: 'Bad Request',
      message: 'Request body must be a valid JSON object'
    });
    return;
  }

  const {
    fullName,
    email,
    experienceYears,
    researchAreas,
    technicalSkills,
    projects,
    publications,
    designation,
    organization,
    education,
    specialization,
    resumeUrl,
    resumeText
  } = req.body;

  // fullName validation
  if (!fullName || typeof fullName !== 'string' || fullName.trim() === '') {
    res.status(400).json({
      success: false,
      error: 'Bad Request',
      message: 'fullName is required and must be a non-empty string'
    });
    return;
  }

  // email validation
  if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
    res.status(400).json({
      success: false,
      error: 'Bad Request',
      message: 'email is required and must be a valid email address'
    });
    return;
  }

  // experienceYears validation
  if (
    experienceYears !== undefined &&
    (typeof experienceYears !== 'number' || experienceYears < 0 || isNaN(experienceYears))
  ) {
    res.status(400).json({
      success: false,
      error: 'Bad Request',
      message: 'experienceYears must be a non-negative number'
    });
    return;
  }

  // Array string fields validation
  const arrayFields = [
    { name: 'researchAreas', value: researchAreas },
    { name: 'technicalSkills', value: technicalSkills },
    { name: 'projects', value: projects },
    { name: 'publications', value: publications }
  ];

  for (const field of arrayFields) {
    if (field.value !== undefined) {
      if (!Array.isArray(field.value) || !field.value.every((item) => typeof item === 'string')) {
        res.status(400).json({
          success: false,
          error: 'Bad Request',
          message: `${field.name} must be an array of strings`
        });
        return;
      }
    }
  }

  // Optional string fields validation
  const optionalStringFields = [
    { name: 'designation', value: designation },
    { name: 'organization', value: organization },
    { name: 'education', value: education },
    { name: 'specialization', value: specialization },
    { name: 'resumeUrl', value: resumeUrl },
    { name: 'resumeText', value: resumeText }
  ];

  for (const field of optionalStringFields) {
    if (field.value !== undefined && typeof field.value !== 'string') {
      res.status(400).json({
        success: false,
        error: 'Bad Request',
        message: `${field.name} must be a string`
      });
      return;
    }
  }

  next();
};

/**
 * Validates the request body for updating an existing Expert.
 */
export const validateUpdateExpert = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (!req.body || typeof req.body !== 'object' || Object.keys(req.body).length === 0) {
    res.status(400).json({
      success: false,
      error: 'Bad Request',
      message: 'Request body cannot be empty'
    });
    return;
  }

  const {
    fullName,
    email,
    experienceYears,
    researchAreas,
    technicalSkills,
    projects,
    publications,
    designation,
    organization,
    education,
    specialization,
    resumeUrl,
    resumeText
  } = req.body;

  // fullName validation if provided
  if (fullName !== undefined && (typeof fullName !== 'string' || fullName.trim() === '')) {
    res.status(400).json({
      success: false,
      error: 'Bad Request',
      message: 'fullName cannot be an empty string'
    });
    return;
  }

  // email validation if provided
  if (email !== undefined && (typeof email !== 'string' || !EMAIL_REGEX.test(email.trim()))) {
    res.status(400).json({
      success: false,
      error: 'Bad Request',
      message: 'email must be a valid email address'
    });
    return;
  }

  // experienceYears validation if provided
  if (
    experienceYears !== undefined &&
    (typeof experienceYears !== 'number' || experienceYears < 0 || isNaN(experienceYears))
  ) {
    res.status(400).json({
      success: false,
      error: 'Bad Request',
      message: 'experienceYears must be a non-negative number'
    });
    return;
  }

  // Array string fields validation if provided
  const arrayFields = [
    { name: 'researchAreas', value: researchAreas },
    { name: 'technicalSkills', value: technicalSkills },
    { name: 'projects', value: projects },
    { name: 'publications', value: publications }
  ];

  for (const field of arrayFields) {
    if (field.value !== undefined) {
      if (!Array.isArray(field.value) || !field.value.every((item) => typeof item === 'string')) {
        res.status(400).json({
          success: false,
          error: 'Bad Request',
          message: `${field.name} must be an array of strings`
        });
        return;
      }
    }
  }

  // Optional string fields validation if provided
  const optionalStringFields = [
    { name: 'designation', value: designation },
    { name: 'organization', value: organization },
    { name: 'education', value: education },
    { name: 'specialization', value: specialization },
    { name: 'resumeUrl', value: resumeUrl },
    { name: 'resumeText', value: resumeText }
  ];

  for (const field of optionalStringFields) {
    if (field.value !== undefined && typeof field.value !== 'string') {
      res.status(400).json({
        success: false,
        error: 'Bad Request',
        message: `${field.name} must be a string`
      });
      return;
    }
  }

  next();
};

