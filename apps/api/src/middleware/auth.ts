// Placeholder for authentication middleware
// This will be implemented with JWT token validation

import { Request, Response, NextFunction } from 'express';

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // TODO: Implement JWT token validation
  // For now, just pass through
  next();
};
