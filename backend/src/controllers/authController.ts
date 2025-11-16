import { Request, Response, NextFunction } from 'express';
import authService from '@/services/authService';
import { asyncHandler, createError } from '@/middleware/errorHandler';
import { AuthRequest } from '@/middleware/auth';

/**
 * Register a new user
 */
export const register = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { email, password, firstName, lastName } = req.body;

  const result = await authService.register({
    email,
    password,
    firstName,
    lastName
  });

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: result
  });
});

/**
 * Login user
 */
export const login = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  const result = await authService.login({
    email,
    password
  });

  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: result
  });
});

/**
 * Refresh access token
 */
export const refreshToken = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { refreshToken } = req.body;

  const result = await authService.refreshToken(refreshToken);

  res.status(200).json({
    success: true,
    message: 'Token refreshed successfully',
    data: result
  });
});

/**
 * Logout user
 */
export const logout = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { refreshToken } = req.body;

  await authService.logout();

  res.status(200).json({
    success: true,
    message: 'Logout successful'
  });
});

/**
 * Forgot password
 */
export const forgotPassword = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { email } = req.body;

  await authService.forgotPassword(email);

  res.status(200).json({
    success: true,
    message: 'If an account with that email exists, a password reset link has been sent'
  });
});

/**
 * Reset password
 */
export const resetPassword = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { token, newPassword } = req.body;

  await authService.resetPassword(token, newPassword);

  res.status(200).json({
    success: true,
    message: 'Password reset successful'
  });
});

/**
 * Verify email
 */
export const verifyEmail = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { token } = req.params;

  await authService.verifyEmail(token);

  res.status(200).json({
    success: true,
    message: 'Email verified successfully'
  });
});

/**
 * Resend verification email
 */
export const resendVerificationEmail = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { email } = req.body;

  await authService.resendVerificationEmail(email);

  res.status(200).json({
    success: true,
    message: 'Verification email sent successfully'
  });
});

/**
 * Change password (authenticated user)
 */
export const changePassword = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const { currentPassword, newPassword } = req.body;

  if (!req.user) {
    throw createError('User not authenticated', 401);
  }

  await authService.changePassword(req.user._id.toString(), currentPassword, newPassword);

  res.status(200).json({
    success: true,
    message: 'Password changed successfully'
  });
});

/**
 * Get current user profile
 */
export const getCurrentUser = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const user = authService.getCurrentUser(req);

  res.status(200).json({
    success: true,
    data: {
      user
    }
  });
});

/**
 * Get authenticated user
 */
export const getMe = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.user) {
    throw createError('User not authenticated', 401);
  }

  res.status(200).json({
    success: true,
    data: {
      user: req.user.getPublicProfile()
    }
  });
});