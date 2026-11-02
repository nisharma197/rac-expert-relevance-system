import mongoose, { Document, Model, Schema } from 'mongoose';

/**
 * Interface representing the Candidate attributes.
 */
export interface ICandidate {
  fullName: string;
  email: string;
  education?: string;
  specialization?: string;
  technicalSkills: string[];
  researchAreas: string[];
  projects: string[];
  experienceYears?: number;
  resumeUrl?: string;
  resumeText?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Interface representing a Candidate Mongoose Document.
 */
export interface ICandidateDocument extends ICandidate, Document {}

/**
 * Mongoose schema definition for the Candidate model.
 */
const candidateSchema = new Schema<ICandidateDocument>(
  {
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        'Please provide a valid email address'
      ]
    },
    education: {
      type: String,
      trim: true,
      default: ''
    },
    specialization: {
      type: String,
      trim: true,
      default: ''
    },
    technicalSkills: {
      type: [String],
      default: []
    },
    researchAreas: {
      type: [String],
      default: []
    },
    projects: {
      type: [String],
      default: []
    },
    experienceYears: {
      type: Number,
      min: [0, 'Experience years cannot be negative'],
      default: 0
    },
    resumeUrl: {
      type: String,
      trim: true
    },
    resumeText: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

export const Candidate: Model<ICandidateDocument> =
  mongoose.models.Candidate || mongoose.model<ICandidateDocument>('Candidate', candidateSchema);

export default Candidate;

