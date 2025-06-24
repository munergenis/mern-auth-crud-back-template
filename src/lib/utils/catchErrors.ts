import { NextFunction, Request, Response } from 'express';

type AsyncController<T = void> = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<T>;

const catchErrors =
  <T>(controller: AsyncController<T>): AsyncController =>
  async (req, res, next) => {
    try {
      await controller(req, res, next);
    } catch (error) {
      next(error);
    }
  };

export default catchErrors;
