import { type Request, type Response, type NextFunction } from 'express';
import { config } from '../config';

export interface ApiError extends Error {
  status?: number;
  statusCode?: number;
}

export function errorHandler(
  err: ApiError,
  _req: Request,
  res: Response,
  next: NextFunction
) {
  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  console.error('Internal Server Error:', err);

  if (res.headersSent) {
    return next(err);
  }

  const response: { error: boolean; message: string; stack?: string } = {
    error: true,
    message,
  };

  if (!config.isProduction && err.stack) {
    response.stack = err.stack;
  }

  return res.status(status).json(response);
}
