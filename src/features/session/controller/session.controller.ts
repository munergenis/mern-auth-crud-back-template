import { UNAUTHORIZED, OK, NOT_FOUND } from '../../../lib/constants/http.js';
import appAssert from '../../../lib/utils/appAssert.js';
import catchErrors from '../../../lib/utils/catchErrors.js';
import SessionModel, { UserSessionObject } from '../models/session.model.js';
import { sessionSchema } from '../schemas/session.schema.js';

export const getSessionHandler = catchErrors(async (req, res) => {
  const userId = req.userId;
  appAssert(userId, UNAUTHORIZED, 'Not Authorized');

  const sessions = await SessionModel.find(
    { expiresAt: { $gt: new Date() }, userId },
    {
      _id: 1,
      createdAt: 1,
      userAgent: 1,
    },
    { sort: { createdAt: -1 } }
  );

  const currentSessionId = req.sessionId;

  res.status(OK).json(
    sessions.map((session) => {
      const isCurrent = session.id === currentSessionId;
      const sessionObj: UserSessionObject = session.toObject();
      if (isCurrent) {
        sessionObj.isCurrent = true;
      }

      return sessionObj;
    })
  );
  return;
});

export const deleteSessionHandler = catchErrors(async (req, res) => {
  const userId = req.userId;
  appAssert(userId, UNAUTHORIZED, 'Not authorized');

  const sessionId = sessionSchema.parse(req.params.sessionId);

  const deletedSession = await SessionModel.findOneAndDelete({
    _id: sessionId,
    userId,
  });
  appAssert(deletedSession, NOT_FOUND, 'Session not found');

  res.status(OK).json({ message: 'Session removed' });
  return;
});
