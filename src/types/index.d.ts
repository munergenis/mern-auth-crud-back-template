import { SessionId } from '../features/session/models/session.model';
import { UserId } from '../features/user/models/user.model';

declare global {
  namespace Express {
    interface Request {
      sessionId: SessionId | undefined;
      userId: undefined | UserId;
    }
  }
}

export {};
