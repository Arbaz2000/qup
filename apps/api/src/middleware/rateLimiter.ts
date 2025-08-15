// Placeholder for rate limiting middleware

import { Request, Response, NextFunction } from 'express';

export const rateLimiter = (req: Request, res: Response, next: NextFunction) => {
  // TODO: Implement rate limiting
  // For now, just pass through
  next();
};
