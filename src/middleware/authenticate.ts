import { RequestHandler } from 'express';
import AppErrorCode from '../lib/constants/appErrorCode';
import { UNAUTHORIZED } from '../lib/constants/http';
import appAssert from '../lib/utils/appAssert';
import { verifyToken } from '../lib/utils/jwt';

const authenticate: RequestHandler = (req, res, next) => {
  const accessToken = req.cookies.accessToken as string | undefined;
  appAssert(
    accessToken,
    UNAUTHORIZED,
    'Not Authorized',
    AppErrorCode.InvalidAccessToken
  );

  const { error, payload } = verifyToken(accessToken);
  appAssert(
    payload,
    UNAUTHORIZED,
    error === 'jwt expired' ? 'Token expired' : 'Invalid token',
    AppErrorCode.InvalidAccessToken
  );

  req.userId = payload.userId;
  req.sessionId = payload.sessionId;
  next();
};

export default authenticate;
