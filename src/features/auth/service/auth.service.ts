import {
  EMAIL_VERIFICATION_EMAIL_WINDOW_MINUTES,
  EMAIL_VERIFICATION_EMAIL_RATE_LIMIT,
  EMAIL_VERIFICATION_CODE_DURATION_DAYS,
  SESSION_REFRESH_THRESHOLD_HOURS,
  SESSION_DURATION_DAYS,
  PASSWORD_RESET_EMAIL_WINDOW_MINUTES,
  PASSWORD_RESET_EMAIL_RATE_LIMIT,
  PASSWORD_RESET_VERIFICATION_CODE_DURATION_HOURS,
} from '../../../config/appGlobalConfig';
import AppErrorCode from '../../../lib/constants/appErrorCode';
import { APP_ORIGIN } from '../../../lib/constants/env';
import {
  CONFLICT,
  TOO_MANY_REQUESTS,
  UNAUTHORIZED,
  FORBIDDEN,
  NOT_FOUND,
  INTERNAL_SERVER_ERROR,
} from '../../../lib/constants/http';
import VerificationCodeType from '../../../lib/constants/verficationCodeTypes';
import appAssert from '../../../lib/utils/appAssert';
import { hashValue } from '../../../lib/utils/bcrypt';
import {
  minutesAgo,
  daysFromNow,
  hoursInMs,
  hoursFromNow,
} from '../../../lib/utils/date';
import {
  getVerifyEmailTemplate,
  getPasswordResetTemplate,
} from '../../../lib/utils/emailTemplates';
import {
  signToken,
  refreshTokenSignOptions,
  verifyToken,
  RefreshTokenPayload,
} from '../../../lib/utils/jwt';
import { sendMail } from '../../../lib/utils/sendMail';
import SessionModel, { SessionId } from '../../session/models/session.model';
import UserModel, { UserId } from '../../user/models/user.model';
import VerificationCodeModel from '../models/verificationCode.model';

export interface CreateAccountParams {
  email: string;
  password: string;
  userAgent?: string;
}

export const createAccount = async (data: CreateAccountParams) => {
  // verify user doesn't exist or it's not verified (by email)
  const existingUser = await UserModel.findOne({ email: data.email });
  const isExistingAndVerifiedUser =
    existingUser !== null && existingUser.verified === true;
  appAssert(!isExistingAndVerifiedUser, CONFLICT, 'User already exists');

  let userId: UserId;
  let userEmail: string;

  if (!existingUser) {
    // create user
    const user = await UserModel.create({
      email: data.email,
      password: data.password,
    });
    userId = user._id as UserId;
    userEmail = user.email;
  } else {
    // update password if user exists but is not verified
    existingUser.set('password', data.password);
    await existingUser.save();
    userId = existingUser._id as UserId;
    userEmail = existingUser.email;
  }

  // rate limit for email verification codes
  const verificationTimeAgo = minutesAgo(
    EMAIL_VERIFICATION_EMAIL_WINDOW_MINUTES
  );
  const verificationCount = await VerificationCodeModel.countDocuments({
    createdAt: { $gt: verificationTimeAgo },
    type: VerificationCodeType.EmailVerification,
    userId,
  });
  appAssert(
    verificationCount < EMAIL_VERIFICATION_EMAIL_RATE_LIMIT,
    TOO_MANY_REQUESTS,
    'Too many verification requests, please try again later'
  );

  // Invalidate previous valid email verification codes for this user
  await VerificationCodeModel.updateMany(
    {
      expiresAt: { $gt: new Date() },
      type: VerificationCodeType.EmailVerification,
      userId,
    },
    { $set: { expiresAt: new Date() } }
  );

  // create verification code
  const verificationCode = await VerificationCodeModel.create({
    expiresAt: daysFromNow(EMAIL_VERIFICATION_CODE_DURATION_DAYS),
    type: VerificationCodeType.EmailVerification,
    userId,
  });

  // send verification email
  const url = `${APP_ORIGIN}/email/verify/${verificationCode._id}`;
  const { error } = await sendMail({
    ...getVerifyEmailTemplate(url),
    to: userEmail,
  });
  if (error) console.error(error);

  // return userEmail
  return { email: userEmail };
};

export interface LoginUserParams {
  email: string;
  password: string;
  userAgent?: string;
}

export const loginUser = async (data: LoginUserParams) => {
  // get user by email
  const user = await UserModel.findOne({ email: data.email });
  appAssert(user, UNAUTHORIZED, 'Invalid email or password');
  const userId = user._id as UserId;

  // validate password from the request
  const isValid = await user.comparePassword(data.password);
  appAssert(isValid, UNAUTHORIZED, 'Invalid email or password');

  // validate is verified
  appAssert(user.verified, FORBIDDEN, 'User is not verified');

  // create session
  const session = await SessionModel.create({
    userAgent: data.userAgent,
    userId,
  });
  const sessionId = session._id as SessionId;

  // sign access token & refresh token
  const refreshTokenPayload = { sessionId };
  const refreshToken = signToken(refreshTokenPayload, refreshTokenSignOptions);

  const accessTokenPayload = { sessionId, userId };
  const accessToken = signToken(accessTokenPayload);

  // return user & tokens
  return { accessToken, refreshToken, user: user.omitPassword() };
};

export const refreshUserAccesssToken = async (refreshToken: string) => {
  const { payload } = verifyToken<RefreshTokenPayload>(refreshToken, {
    secret: refreshTokenSignOptions.secret,
  });
  appAssert(
    payload,
    UNAUTHORIZED,
    'Invalid Refresh Token',
    AppErrorCode.InvalidRefreshToken
  );

  const session = await SessionModel.findById(payload.sessionId);
  appAssert(
    session && session.expiresAt.getTime() > Date.now(),
    UNAUTHORIZED,
    'Session expired'
  );

  // refresh session if it expires in the SESSION_REFRESH_THRESHOLD from globalconfig
  const sessionNeedsRefresh =
    session.expiresAt.getTime() - Date.now() <=
    hoursInMs(SESSION_REFRESH_THRESHOLD_HOURS);
  if (sessionNeedsRefresh) {
    session.expiresAt = daysFromNow(SESSION_DURATION_DAYS);
    await session.save();
  }

  const newRefreshToken = sessionNeedsRefresh
    ? signToken(payload, refreshTokenSignOptions)
    : undefined;

  const accessTokenPayload = {
    sessionId: payload.sessionId,
    userId: session.userId,
  };
  const accessToken = signToken(accessTokenPayload);

  return { accessToken, newRefreshToken };
};

export const verifyEmail = async (code: string) => {
  // get and verify the verification code
  const validCode = await VerificationCodeModel.findOne({
    _id: code,
    expiresAt: { $gt: new Date() },
    type: VerificationCodeType.EmailVerification,
  });
  appAssert(validCode, NOT_FOUND, 'Invalid or expired verification code');

  // update user to verified true
  const updatedUser = await UserModel.findByIdAndUpdate(
    validCode.userId,
    { verified: true },
    { new: true }
  );
  appAssert(updatedUser, INTERNAL_SERVER_ERROR, 'Failed to verify email');

  // delete all email verification codes for this user
  await VerificationCodeModel.deleteMany({
    type: VerificationCodeType.EmailVerification,
    userId: validCode.userId,
  });

  // return user
  return { user: updatedUser.omitPassword() };
};

export const sendPasswordResetEmail = async (email: string) => {
  // get user by email
  const user = await UserModel.findOne({ email });
  appAssert(user, NOT_FOUND, 'User not found');
  appAssert(user.verified, FORBIDDEN, 'User is not verified');

  // check email rate limit
  const timeAgo = minutesAgo(PASSWORD_RESET_EMAIL_WINDOW_MINUTES);
  const count = await VerificationCodeModel.countDocuments({
    createdAt: { $gt: timeAgo },
    type: VerificationCodeType.PasswordReset,
    userId: user._id,
  });
  appAssert(
    count < PASSWORD_RESET_EMAIL_RATE_LIMIT,
    TOO_MANY_REQUESTS,
    'Too many requests, please try again later'
  );

  // create verification code
  const expiresAt = hoursFromNow(
    PASSWORD_RESET_VERIFICATION_CODE_DURATION_HOURS
  );
  const verificationCode = await VerificationCodeModel.create({
    expiresAt,
    type: VerificationCodeType.PasswordReset,
    userId: user._id,
  });

  // send verification email
  const url = `${APP_ORIGIN}/password/reset?code=${verificationCode._id}&exp=${expiresAt.getTime()}`;
  const { data, error } = await sendMail({
    ...getPasswordResetTemplate(url),
    to: user.email,
  });
  appAssert(
    data?.messageId,
    INTERNAL_SERVER_ERROR,
    `${error?.name} - ${error?.message}`
  );

  // return success
  return {
    emailId: data.messageId,
    url,
  };
};

interface ResetPasswordParams {
  password: string;
  verificationCode: string;
}

export const resetPassword = async (data: ResetPasswordParams) => {
  // get verification code document
  const verificationCode = await VerificationCodeModel.findOne({
    _id: data.verificationCode,
    expiresAt: { $gt: new Date() },
    type: VerificationCodeType.PasswordReset,
  });
  appAssert(verificationCode, NOT_FOUND, 'Invalid verification code');

  // update user's password
  const user = await UserModel.findByIdAndUpdate(
    verificationCode.userId,
    {
      password: await hashValue(data.password),
    },
    { new: true }
  );
  appAssert(user, INTERNAL_SERVER_ERROR, 'Failed to reset password');

  // delete all password reset codes for this user
  await VerificationCodeModel.deleteMany({
    type: VerificationCodeType.PasswordReset,
    userId: user._id,
  });

  // delete all sessions
  await SessionModel.deleteMany({ userId: user._id });

  // return success
  return { user: user.omitPassword() };
};
