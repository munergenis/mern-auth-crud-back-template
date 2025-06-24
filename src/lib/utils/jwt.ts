import jwt, { VerifyOptions } from 'jsonwebtoken';
import { SignOptions } from 'jsonwebtoken';
import {
  ACCESS_TOKEN_DURATION_MINUTES,
  REFRESH_TOKEN_DURATION_DAYS,
} from '../../config/appGlobalConfig';
import { SessionId } from '../../features/session/models/session.model';
import { UserId } from '../../features/user/models/user.model';
import { JWT_SECRET, JWT_REFRESH_SECRET } from '../constants/env';

export interface AccessTokenPayload {
  sessionId: SessionId;
  userId: UserId;
}
export interface RefreshTokenPayload {
  sessionId: SessionId;
}

const defaults: SignOptions = {
  audience: ['user'],
};

const accessTokenSignOptions: SignOptionsAndSecret = {
  expiresIn: `${ACCESS_TOKEN_DURATION_MINUTES}m`,
  secret: JWT_SECRET,
};
export const refreshTokenSignOptions: SignOptionsAndSecret = {
  expiresIn: `${REFRESH_TOKEN_DURATION_DAYS}d`,
  secret: JWT_REFRESH_SECRET,
};

type SignOptionsAndSecret = SignOptions & { secret: string };

/**
 * Signs a JWT token with the given payload and options.
 *
 * @param payload - The payload to include in the JWT, either AccessTokenPayload or RefreshTokenPayload.
 * @param options - Optional signing options and secret for the JWT. Defaults to accessTokenSignOptions.
 * @returns The signed JWT as a string.
 */
export const signToken = (
  payload: AccessTokenPayload | RefreshTokenPayload,
  options: SignOptionsAndSecret = accessTokenSignOptions
) => {
  const { secret, ...signOpts } = options;
  return jwt.sign(payload, secret, { ...defaults, ...signOpts });
};

type VerifyOptionsAndSecret = VerifyOptions & { secret: string };

export const verifyToken = <T extends object = AccessTokenPayload>(
  token: string,
  options?: VerifyOptionsAndSecret
) => {
  const { secret = JWT_SECRET, ...verifyOpts } = options ?? {};
  try {
    const payload = jwt.verify(token, secret, {
      ...defaults,
      ...verifyOpts,
    }) as T;
    return { payload };
  } catch (error) {
    return { error: error instanceof Error ? error.message : String(error) };
  }
};
