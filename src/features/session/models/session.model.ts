import mongoose from 'mongoose';
import { SESSION_DURATION_DAYS } from '../../../config/appGlobalConfig';
import { daysFromNow } from '../../../lib/utils/date';

export interface SessionDocument extends mongoose.Document {
  createdAt: Date;
  expiresAt: Date;
  userAgent?: string;
  userId: mongoose.Types.ObjectId;
}

export type SessionId = mongoose.Types.ObjectId;

export type UserSessionObject = Partial<SessionDocument> & {
  isCurrent?: boolean;
};

const sessionSchema = new mongoose.Schema<SessionDocument>({
  createdAt: { default: Date.now, required: true, type: Date },
  expiresAt: {
    default: () => daysFromNow(SESSION_DURATION_DAYS),
    required: true,
    type: Date,
  },
  userAgent: { type: String },
  userId: { index: true, ref: 'User', type: mongoose.Schema.Types.ObjectId },
});

const SessionModel = mongoose.model<SessionDocument>('Session', sessionSchema);
export default SessionModel;
