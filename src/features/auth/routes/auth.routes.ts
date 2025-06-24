import { Router } from 'express';
import { NODE_ENV } from '../../../lib/constants/env';
import { FORBIDDEN } from '../../../lib/constants/http';
import appAssert from '../../../lib/utils/appAssert';
import catchErrors from '../../../lib/utils/catchErrors';
import SessionModel from '../../session/models/session.model';
import UserModel from '../../user/models/user.model';
import {
  registerHandler,
  loginHandler,
  refreshHandler,
  logoutHandler,
  verifyEmailHandler,
  sendPasswordResetHandler,
  resetPasswordHandler,
} from '../controller/auth.controller';
import VerificationCodeModel from '../models/verificationCode.model';

const authRoutes = Router();

// prefix: /auth
authRoutes.post('/register', registerHandler);
authRoutes.post('/login', loginHandler);
authRoutes.get('/refresh', refreshHandler);
authRoutes.post('/logout', logoutHandler);
authRoutes.get('/email/verify/:code', verifyEmailHandler);
authRoutes.post('/password/forgot', sendPasswordResetHandler);
authRoutes.post('/password/reset', resetPasswordHandler);

// TODO: Delete after testing
authRoutes.delete(
  '/sessions',
  catchErrors(async (req, res) => {
    appAssert(
      NODE_ENV === 'development',
      FORBIDDEN,
      'Can not perform this action outside dev environment'
    );
    await SessionModel.deleteMany({});
    res.status(200).json({ message: 'Deleted all sessions' });
    return;
  })
);
authRoutes.delete(
  '/users',
  catchErrors(async (req, res) => {
    appAssert(
      NODE_ENV === 'development',
      FORBIDDEN,
      'Can not perform this action outside dev environment'
    );
    await UserModel.deleteMany({});
    res.status(200).json({ message: 'Deleted all users' });
    return;
  })
);
authRoutes.delete(
  '/verification',
  catchErrors(async (req, res) => {
    appAssert(
      NODE_ENV === 'development',
      FORBIDDEN,
      'Can not perform this action outside dev environment'
    );
    await VerificationCodeModel.deleteMany({});
    res.status(200).json({ message: 'Deleted all verification codes' });
    return;
  })
);
authRoutes.delete(
  '/destroy',
  catchErrors(async (req, res) => {
    appAssert(
      NODE_ENV === 'development',
      FORBIDDEN,
      'Can not perform this action outside dev environment'
    );
    await SessionModel.deleteMany({});
    await UserModel.deleteMany({});
    await VerificationCodeModel.deleteMany({});
    res.status(200).json({ message: 'Destroyed all db content successfully' });
    return;
  })
);

export default authRoutes;
