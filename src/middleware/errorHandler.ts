import { ErrorRequestHandler, Response } from 'express';
import { ZodError } from 'zod';
import { BAD_REQUEST, INTERNAL_SERVER_ERROR } from '../lib/constants/http';
import AppError from '../lib/utils/AppError';
import { REFRESH_PATH, clearAuthCookies } from '../lib/utils/cookies';

const handleZodError = (res: Response, error: ZodError) => {
  const errors = error.issues.map((err) => ({
    message: err.message,
    path: err.path.join('.'),
  }));

  res.status(BAD_REQUEST).json({
    errors,
    message: `${JSON.parse(error.message).length} Errors`,
  });
};

const handleAppError = (res: Response, error: AppError) => {
  res
    .status(error.statusCode)
    .json({ errorCode: error.errorCode, message: error.message });
};

const errorHandler: ErrorRequestHandler = (error, req, res, next) => {
  console.log(`PATH ${req.path}`, error);

  if (req.path === REFRESH_PATH) {
    clearAuthCookies(res);
  }

  if (error instanceof ZodError) {
    handleZodError(res, error);
    return;
  }

  if (error instanceof AppError) {
    handleAppError(res, error);
    return;
  }

  res.status(INTERNAL_SERVER_ERROR).send(`Internal Server Error`);
  return;
  next();
};

export default errorHandler;
