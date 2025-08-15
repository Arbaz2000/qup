import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { UserRole } from '@qup/shared';

const prisma = new PrismaClient();

// Extend Express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: UserRole;
      };
    }
  }
}

// JWT token validation middleware
export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    
    // Get user from database to ensure they still exist and get latest role
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        role: true,
        status: true
      }
    });

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    // Update last seen timestamp
    await prisma.user.update({
      where: { id: user.id },
      data: { lastSeenAt: new Date() }
    });

    req.user = user;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ error: 'Token expired' });
    }
    
    console.error('Authentication error:', error);
    return res.status(500).json({ error: 'Authentication failed' });
  }
};

// Optional authentication middleware (doesn't fail if no token)
export const optionalAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return next(); // Continue without user
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        role: true,
        status: true
      }
    });

    if (user) {
      req.user = user;
    }
    
    next();
  } catch (error) {
    // Continue without user if token is invalid
    next();
  }
};

// Role-based authorization middleware
export const requireRole = (requiredRole: UserRole) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (req.user.role !== requiredRole && req.user.role !== UserRole.ADMIN) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
};

// Admin-only middleware
export const requireAdmin = requireRole(UserRole.ADMIN);

// Moderator or higher middleware
export const requireModerator = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (req.user.role !== UserRole.MODERATOR && req.user.role !== UserRole.ADMIN) {
    return res.status(403).json({ error: 'Moderator access required' });
  }

  next();
};

// Special user or higher middleware
export const requireSpecial = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (req.user.role !== UserRole.SPECIAL && 
      req.user.role !== UserRole.MODERATOR && 
      req.user.role !== UserRole.ADMIN) {
    return res.status(403).json({ error: 'Special access required' });
  }

  next();
};

// Channel access middleware
export const requireChannelAccess = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const channelId = req.params.channelId || req.body.channelId;
    if (!channelId) {
      return res.status(400).json({ error: 'Channel ID required' });
    }

    const channel = await prisma.channel.findUnique({
      where: { id: channelId },
      include: { members: true }
    });

    if (!channel) {
      return res.status(404).json({ error: 'Channel not found' });
    }

    // Public channels are accessible to everyone
    if (channel.type === 'PUBLIC') {
      return next();
    }

    // Private channels require membership or creator access
    const isMember = channel.members.some(member => member.userId === req.user!.id);
    const isCreator = channel.createdBy === req.user!.id;

    if (!isMember && !isCreator) {
      return res.status(403).json({ error: 'Access denied to private channel' });
    }

    next();
  } catch (error) {
    console.error('Channel access check error:', error);
    return res.status(500).json({ error: 'Channel access check failed' });
  }
};

// Resource ownership middleware
export const requireOwnership = (resourceType: 'message' | 'question' | 'channel') => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const resourceId = req.params.id || req.params.messageId || req.params.questionId || req.params.channelId;
      if (!resourceId) {
        return res.status(400).json({ error: 'Resource ID required' });
      }

      let resource: any = null;

      switch (resourceType) {
        case 'message':
          resource = await prisma.message.findUnique({
            where: { id: resourceId },
            select: { authorId: true }
          });
          break;
        case 'question':
          resource = await prisma.question.findUnique({
            where: { id: resourceId },
            select: { authorId: true }
          });
          break;
        case 'channel':
          resource = await prisma.channel.findUnique({
            where: { id: resourceId },
            select: { createdBy: true }
          });
          break;
      }

      if (!resource) {
        return res.status(404).json({ error: 'Resource not found' });
      }

      const isOwner = resource.authorId === req.user.id || resource.createdBy === req.user.id;
      const isAdmin = req.user.role === UserRole.ADMIN;
      const isModerator = req.user.role === UserRole.MODERATOR;

      if (!isOwner && !isAdmin && !isModerator) {
        return res.status(403).json({ error: 'Access denied' });
      }

      next();
    } catch (error) {
      console.error('Ownership check error:', error);
      return res.status(500).json({ error: 'Ownership check failed' });
    }
  };
};

// Rate limiting middleware (basic implementation)
export const rateLimit = (maxRequests: number = 100, windowMs: number = 15 * 60 * 1000) => {
  const requests = new Map<string, { count: number; resetTime: number }>();

  return (req: Request, res: Response, next: NextFunction) => {
    const key = req.ip || 'unknown';
    const now = Date.now();

    const userRequests = requests.get(key);
    
    if (!userRequests || now > userRequests.resetTime) {
      requests.set(key, { count: 1, resetTime: now + windowMs });
    } else {
      userRequests.count++;
      
      if (userRequests.count > maxRequests) {
        return res.status(429).json({ error: 'Too many requests' });
      }
    }

    next();
  };
};
