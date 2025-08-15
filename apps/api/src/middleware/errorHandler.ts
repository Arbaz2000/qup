import { Request, Response, NextFunction } from 'express';
import { GraphQLError } from 'graphql';
import { logger } from '../utils/logger';

// Custom error class for API errors
export class APIError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Error types
export const ErrorTypes = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',
  NOT_FOUND_ERROR: 'NOT_FOUND_ERROR',
  CONFLICT_ERROR: 'CONFLICT_ERROR',
  RATE_LIMIT_ERROR: 'RATE_LIMIT_ERROR',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  EXTERNAL_SERVICE_ERROR: 'EXTERNAL_SERVICE_ERROR'
} as const;

// Error codes mapping
const errorCodeMap: Record<string, number> = {
  [ErrorTypes.VALIDATION_ERROR]: 400,
  [ErrorTypes.AUTHENTICATION_ERROR]: 401,
  [ErrorTypes.AUTHORIZATION_ERROR]: 403,
  [ErrorTypes.NOT_FOUND_ERROR]: 404,
  [ErrorTypes.CONFLICT_ERROR]: 409,
  [ErrorTypes.RATE_LIMIT_ERROR]: 429,
  [ErrorTypes.INTERNAL_ERROR]: 500,
  [ErrorTypes.EXTERNAL_SERVICE_ERROR]: 502
};

// Format error response
const formatError = (error: any, req: Request) => {
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  const baseError = {
    message: error.message || 'Internal server error',
    type: error.type || ErrorTypes.INTERNAL_ERROR,
    timestamp: new Date().toISOString(),
    path: req.path,
    method: req.method
  };

  if (isDevelopment) {
    return {
      ...baseError,
      stack: error.stack,
      details: error.details || null
    };
  }

  return baseError;
};

// Global error handler middleware
export const errorHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCode = 500;
  let errorType = ErrorTypes.INTERNAL_ERROR;

  // Handle different error types
  if (error instanceof APIError) {
    statusCode = error.statusCode;
    errorType = error.message.includes('validation') ? ErrorTypes.VALIDATION_ERROR :
                error.message.includes('authentication') ? ErrorTypes.AUTHENTICATION_ERROR :
                error.message.includes('authorization') ? ErrorTypes.AUTHORIZATION_ERROR :
                error.message.includes('not found') ? ErrorTypes.NOT_FOUND_ERROR :
                error.message.includes('conflict') ? ErrorTypes.CONFLICT_ERROR :
                ErrorTypes.INTERNAL_ERROR;
  } else if (error instanceof GraphQLError) {
    statusCode = error.extensions?.code === 'UNAUTHENTICATED' ? 401 :
                 error.extensions?.code === 'FORBIDDEN' ? 403 :
                 error.extensions?.code === 'NOT_FOUND' ? 404 :
                 error.extensions?.code === 'BAD_USER_INPUT' ? 400 : 500;
    errorType = error.extensions?.code === 'UNAUTHENTICATED' ? ErrorTypes.AUTHENTICATION_ERROR :
                error.extensions?.code === 'FORBIDDEN' ? ErrorTypes.AUTHORIZATION_ERROR :
                error.extensions?.code === 'NOT_FOUND' ? ErrorTypes.NOT_FOUND_ERROR :
                error.extensions?.code === 'BAD_USER_INPUT' ? ErrorTypes.VALIDATION_ERROR :
                ErrorTypes.INTERNAL_ERROR;
  } else if (error.name === 'ValidationError') {
    statusCode = 400;
    errorType = ErrorTypes.VALIDATION_ERROR;
  } else if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
    statusCode = 401;
    errorType = ErrorTypes.AUTHENTICATION_ERROR;
  } else if (error.name === 'PrismaClientKnownRequestError') {
    // Handle Prisma errors
    switch (error.code) {
      case 'P2002': // Unique constraint violation
        statusCode = 409;
        errorType = ErrorTypes.CONFLICT_ERROR;
        error.message = 'Resource already exists';
        break;
      case 'P2025': // Record not found
        statusCode = 404;
        errorType = ErrorTypes.NOT_FOUND_ERROR;
        error.message = 'Resource not found';
        break;
      case 'P2003': // Foreign key constraint violation
        statusCode = 400;
        errorType = ErrorTypes.VALIDATION_ERROR;
        error.message = 'Invalid reference';
        break;
      default:
        statusCode = 500;
        errorType = ErrorTypes.INTERNAL_ERROR;
    }
  } else if (error.name === 'PrismaClientValidationError') {
    statusCode = 400;
    errorType = ErrorTypes.VALIDATION_ERROR;
    error.message = 'Invalid data provided';
  } else if (error.code === 'LIMIT_FILE_SIZE') {
    statusCode = 413;
    errorType = ErrorTypes.VALIDATION_ERROR;
    error.message = 'File too large';
  } else if (error.code === 'LIMIT_UNEXPECTED_FILE') {
    statusCode = 400;
    errorType = ErrorTypes.VALIDATION_ERROR;
    error.message = 'Unexpected file field';
  }

  // Log error
  const logLevel = statusCode >= 500 ? 'error' : 'warn';
  logger[logLevel]('API Error', {
    error: {
      message: error.message,
      stack: error.stack,
      type: errorType,
      statusCode
    },
    request: {
      method: req.method,
      url: req.url,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      userId: req.user?.id
    }
  });

  // Send error response
  const errorResponse = formatError(error, req);
  
  res.status(statusCode).json({
    error: errorResponse
  });
};

// 404 handler for unmatched routes
export const notFoundHandler = (req: Request, res: Response) => {
  const error = new APIError(`Route ${req.method} ${req.path} not found`, 404);
  
  logger.warn('Route not found', {
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  res.status(404).json({
    error: formatError(error, req)
  });
};

// Async error wrapper for route handlers
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Validation error handler
export const validationErrorHandler = (error: any, req: Request, res: Response, next: NextFunction) => {
  if (error.name === 'ValidationError' || error.name === 'ZodError') {
    const validationError = new APIError('Validation failed', 400);
    validationError.details = error.details || error.errors;
    return next(validationError);
  }
  next(error);
};

// Rate limit error handler
export const rateLimitErrorHandler = (error: any, req: Request, res: Response, next: NextFunction) => {
  if (error.message === 'Too many requests') {
    const rateLimitError = new APIError('Rate limit exceeded', 429);
    return next(rateLimitError);
  }
  next(error);
};

// Database connection error handler
export const databaseErrorHandler = (error: any, req: Request, res: Response, next: NextFunction) => {
  if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
    const dbError = new APIError('Database connection failed', 503);
    return next(dbError);
  }
  next(error);
};

// External service error handler
export const externalServiceErrorHandler = (error: any, req: Request, res: Response, next: NextFunction) => {
  if (error.code === 'ECONNRESET' || error.code === 'ETIMEDOUT') {
    const serviceError = new APIError('External service unavailable', 502);
    return next(serviceError);
  }
  next(error);
};
