import mongoose, { Document, Model, Schema } from 'mongoose';

/**
 * Interface representing the Expert attributes.
 */
export interface IExpert {
  fullName: string;
  email: string;
  designation?: string;
  organization?: string;
  education?: string;
  specialization?: string;
  researchAreas: string[];
  technicalSkills: string[];
  experienceYears?: number;
  projects: string[];
  publications: string[];
  resumeUrl?: string;
  resumeText?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Interface representing an Expert Mongoose Document.
 */
export interface IExpertDocument extends IExpert, Document {}

/**
 * Mongoose schema definition for the Expert model.
 */
const expertSchema = new Schema<IExpertDocument>(
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
    designation: {
      type: String,
      trim: true,
      default: ''
    },
    organization: {
      type: String,
      trim: true,
      default: ''
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
    researchAreas: {
      type: [String],
      default: []
    },
    technicalSkills: {
      type: [String],
      default: []
    },
    experienceYears: {
      type: Number,
      min: [0, 'Experience years cannot be negative'],
      default: 0
    },
    projects: {
      type: [String],
      default: []
    },
    publications: {
      type: [String],
      default: []
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

export const Expert: Model<IExpertDocument> =
  mongoose.models.Expert || mongoose.model<IExpertDocument>('Expert', expertSchema);

export default Expert;

