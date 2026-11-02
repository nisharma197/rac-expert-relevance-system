import mongoose, { Document, Model, Schema } from 'mongoose';

/**
 * Allowed status values for an Interview Board.
 */
export type InterviewBoardStatus = 'draft' | 'ready' | 'completed';

/**
 * Interface representing the InterviewBoard attributes.
 */
export interface IInterviewBoard {
  boardTitle: string;
  subject: string;
  description?: string;
  requiredExpertise: string[];
  candidateIds: mongoose.Types.ObjectId[];
  status: InterviewBoardStatus;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Interface representing an InterviewBoard Mongoose Document.
 */
export interface IInterviewBoardDocument extends IInterviewBoard, Document {}

/**
 * Mongoose schema definition for the InterviewBoard model.
 */
const interviewBoardSchema = new Schema<IInterviewBoardDocument>(
  {
    boardTitle: {
      type: String,
      required: [true, 'Board title is required'],
      trim: true
    },
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      trim: true
    },
    description: {
      type: String,
      trim: true,
      default: ''
    },
    requiredExpertise: {
      type: [String],
      default: []
    },
    candidateIds: {
      type: [{ type: Schema.Types.ObjectId, ref: 'Candidate' }],
      default: []
    },
    status: {
      type: String,
      enum: {
        values: ['draft', 'ready', 'completed'],
        message: '{VALUE} is not a valid status'
      },
      default: 'draft'
    }
  },
  {
    timestamps: true
  }
);

export const InterviewBoard: Model<IInterviewBoardDocument> =
  mongoose.models.InterviewBoard ||
  mongoose.model<IInterviewBoardDocument>('InterviewBoard', interviewBoardSchema);

export default InterviewBoard;

