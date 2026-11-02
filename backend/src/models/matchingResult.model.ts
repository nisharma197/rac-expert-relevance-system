import mongoose, { Document, Model, Schema } from 'mongoose';

/**
 * Score breakdown for the 5 weighted matching components.
 */
export interface IScoreBreakdown {
  boardSubject: number;
  candidateExpertise: number;
  researchRelevance: number;
  experience: number;
  technicalSkills: number;
}

export type MatchingStatus = 'Recommended' | 'Shortlisted' | 'Under Review' | 'Selected';

/**
 * Interface representing a stored Matching Result document.
 */
export interface IMatchingResult {
  boardId: mongoose.Types.ObjectId;
  expertId: mongoose.Types.ObjectId;
  overallScore: number;
  scores: IScoreBreakdown;
  matchedDomains: string[];
  weakDomains: string[];
  explanations: string[];
  status: MatchingStatus;
  runDate: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IMatchingResultDocument extends IMatchingResult, Document {}

const matchingResultSchema = new Schema<IMatchingResultDocument>(
  {
    boardId: {
      type: Schema.Types.ObjectId,
      ref: 'InterviewBoard',
      required: [true, 'boardId is required'],
      index: true
    },
    expertId: {
      type: Schema.Types.ObjectId,
      ref: 'Expert',
      required: [true, 'expertId is required'],
      index: true
    },
    overallScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },
    scores: {
      boardSubject: { type: Number, default: 0, min: 0, max: 100 },
      candidateExpertise: { type: Number, default: 0, min: 0, max: 100 },
      researchRelevance: { type: Number, default: 0, min: 0, max: 100 },
      experience: { type: Number, default: 0, min: 0, max: 100 },
      technicalSkills: { type: Number, default: 0, min: 0, max: 100 }
    },
    matchedDomains: {
      type: [String],
      default: []
    },
    weakDomains: {
      type: [String],
      default: []
    },
    explanations: {
      type: [String],
      default: []
    },
    status: {
      type: String,
      enum: ['Recommended', 'Shortlisted', 'Under Review', 'Selected'],
      default: 'Recommended'
    },
    runDate: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

// Compound index to ensure uniqueness per board-expert run
matchingResultSchema.index({ boardId: 1, expertId: 1 });

export const MatchingResult: Model<IMatchingResultDocument> =
  mongoose.models.MatchingResult ||
  mongoose.model<IMatchingResultDocument>('MatchingResult', matchingResultSchema);

export default MatchingResult;

