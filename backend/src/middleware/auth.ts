import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User, { IUser } from '@/models/User';
import { createError } from './errorHandler';

export interface AuthRequest extends Request {
  user?: IUser;
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

// Generate JWT access token
export const generateAccessToken = (user: IUser): string => {
  const payload: JWTPayload = {
    userId: user._id.toString(),
    email: user.email,
    role: user.role
  };

  return jwt.sign(payload, process.env.JWT_SECRET!, {
    expiresIn: process.env.JWT_EXPIRE || '15m',
    issuer: 'eventhub',
    audience: 'eventhub-users'
  });
};

// Generate JWT refresh token
export const generateRefreshToken = (user: IUser): string => {
  const payload = {
    userId: user._id.toString(),
    tokenVersion: Date.now() // To invalidate all refresh tokens
  };

  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET!, {
    expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d',
    issuer: 'eventhub',
    audience: 'eventhub-refresh'
  });
};

// Verify JWT token
export const verifyToken = (token: string, secret: string): JWTPayload => {
  try {
    return jwt.verify(token, secret, {
      issuer: 'eventhub',
      audience: secret === process.env.JWT_SECRET ? 'eventhub-users' : 'eventhub-refresh'
    }) as JWTPayload;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw createError('Token has expired', 401);
    } else if (error instanceof jwt.JsonWebTokenError) {
      throw createError('Invalid token', 401);
    } else {
      throw createError('Token verification failed', 401);
    }
  }
};

// Authentication middleware
export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw createError('Access token required', 401);
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    if (!token) {
      throw createError('Access token required', 401);
    }

    // Verify token
    const decoded = verifyToken(token, process.env.JWT_SECRET!);

    // Get user from database
    const user = await User.findById(decoded.userId).select('-passwordHash');

    if (!user) {
      throw createError('User not found', 401);
    }

    if (!user.isActive) {
      throw createError('Account is deactivated', 401);
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

// Optional authentication (doesn't throw error if no token)
export const optionalAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(); // No token, continue without user
    }

    const token = authHeader.substring(7);

    if (!token) {
      return next();
    }

    // Verify token
    const decoded = verifyToken(token, process.env.JWT_SECRET!);

    // Get user from database
    const user = await User.findById(decoded.userId).select('-passwordHash');

    if (user && user.isActive) {
      req.user = user;
    }

    next();
  } catch (error) {
    // For optional auth, we don't throw errors, just continue without user
    next();
  }
};

// Role-based authorization middleware
export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(createError('Authentication required', 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(createError('Insufficient permissions', 403));
    }

    next();
  };
};

// Check if user is admin
export const requireAdmin = authorize('admin');

// Check if user is organizer or admin
export const requireOrganizer = authorize('organizer', 'admin');

// Check if user owns the resource or is admin
export const requireOwnershipOrAdmin = (resourceUserIdField: string = 'userId') => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(createError('Authentication required', 401));
    }

    // Admin can access any resource
    if (req.user.role === 'admin') {
      return next();
    }

    // Check if user owns the resource
    const resourceUserId = req.params[resourceUserIdField] || req.body[resourceUserIdField];

    if (resourceUserId && resourceUserId === req.user._id.toString()) {
      return next();
    }

    next(createError('Access denied', 403));
  };
};

// Verify refresh token
export const verifyRefreshToken = async (token: string): Promise<IUser> => {
  try {
    const decoded = verifyToken(token, process.env.JWT_REFRESH_SECRET!) as any;

    const user = await User.findById(decoded.userId).select('-passwordHash');

    if (!user) {
      throw createError('User not found', 401);
    }

    if (!user.isActive) {
      throw createError('Account is deactivated', 401);
    }

    return user;
  } catch (error) {
    throw error;
  }
};

// Generate token pair
export const generateTokenPair = (user: IUser) => {
  return {
    accessToken: generateAccessToken(user),
    refreshToken: generateRefreshToken(user),
    expiresIn: process.env.JWT_EXPIRE || '15m'
  };
};