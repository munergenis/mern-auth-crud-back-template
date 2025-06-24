import { CREATED, OK, UNAUTHORIZED } from '../../../lib/constants/http.js';
import SessionModel from '../../session/models/session.model.js';
import {
  createAccount,
  loginUser,
  refreshUserAccesssToken,
  resetPassword,
  sendPasswordResetEmail,
  verifyEmail,
} from '../service/auth.service.js';
import AppErrorCode from '../../../lib/constants/appErrorCode.js';

import appAssert from '../../../lib/utils/appAssert.js';
import catchErrors from '../../../lib/utils/catchErrors.js';
import {
  clearAuthCookies,
  setAccessCookie,
  setAuthCookies,
} from '../../../lib/utils/cookies.js';
import { verifyToken } from '../../../lib/utils/jwt.js';
import {
  emailSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  verificationCodeSchema,
} from '../schemas/auth.schemas.js';

export const registerHandler = catchErrors(async (req, res) => {
  // validate request
  const requestData = registerSchema.parse({
    ...req.body,
    userAgent: req.headers['user-agent'],
  });

  // call service
  const { email } = await createAccount(requestData);

  // return response
  res.status(CREATED).json(email);
  return;
});

export const loginHandler = catchErrors(async (req, res) => {
  // validate request
  const request = loginSchema.parse({
    ...req.body,
    userAgent: req.headers['user-agent'],
  });

  // call service
  const { accessToken, refreshToken } = await loginUser(request);

  // return response
  setAuthCookies({ accessToken, refreshToken, res })
    .status(OK)
    .json({ message: 'Login successful' });
  return;
});

export const logoutHandler = catchErrors(async (req, res) => {
  // assert token
  const accessToken = req.cookies.accessToken as string | undefined;
  appAssert(
    accessToken,
    UNAUTHORIZED,
    'Invalid Access Token',
    AppErrorCode.InvalidAccessToken
  );

  const { payload } = verifyToken(accessToken);
  appAssert(
    payload,
    UNAUTHORIZED,
    'Invalid Access Token',
    AppErrorCode.InvalidAccessToken
  );

  // delete session
  await SessionModel.findByIdAndDelete(payload.sessionId);

  // clear cookies
  clearAuthCookies(res).status(OK).json({ message: 'Logout successful' });
  return;
});

export const refreshHandler = catchErrors(async (req, res) => {
  // assert token
  const refreshToken = req.cookies.refreshToken as string | undefined;
  appAssert(
    refreshToken,
    UNAUTHORIZED,
    'Invalid Refresh Token',
    AppErrorCode.InvalidRefreshToken
  );

  // call service
  const { accessToken, newRefreshToken } =
    await refreshUserAccesssToken(refreshToken);

  // add both cookies if needed
  if (newRefreshToken) {
    setAuthCookies({ accessToken, refreshToken: newRefreshToken, res })
      .status(OK)
      .json({ message: 'Session refresh successful' });
    return;
  }

  // else add access cookie
  setAccessCookie({ accessToken, res })
    .status(OK)
    .json({ message: 'Session refresh successful' });
  return;
});

export const verifyEmailHandler = catchErrors(async (req, res) => {
  // validate request
  const verificationCode = verificationCodeSchema.parse(req.params.code);

  // call service
  await verifyEmail(verificationCode);

  // return success
  res.status(200).json({ message: 'Email was successfully verified' });
  return;
});

export const sendPasswordResetHandler = catchErrors(async (req, res) => {
  const email = emailSchema.parse(req.body.email);

  await sendPasswordResetEmail(email);

  res.status(OK).json({ message: 'Password reset email sent' });
  return;
});

export const resetPasswordHandler = catchErrors(async (req, res) => {
  const request = resetPasswordSchema.parse(req.body);

  await resetPassword(request);

  clearAuthCookies(res)
    .status(OK)
    .json({ message: 'Password reset successful' });
  return;
});
