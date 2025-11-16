import crypto from 'crypto';
import User, { IUser } from '@/models/User';
import {
  generateTokenPair,
  verifyRefreshToken,
  generateAccessToken,
  AuthRequest
} from '@/middleware/auth';
import { createError } from '@/middleware/errorHandler';

export interface LoginData {
  email: string;
  password: string;
}

export interface RegistrationData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface AuthResponse {
  user: any;
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
}

class AuthService {
  /**
   * Register a new user
   */
  async register(userData: RegistrationData): Promise<AuthResponse> {
    const { email, password, firstName, lastName } = userData;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw createError('User with this email already exists', 409);
    }

    // Create new user
    const user = new User({
      email,
      passwordHash: password, // Will be hashed by pre-save middleware
      firstName,
      lastName,
      isEmailVerified: false, // Will be verified via email
      emailVerificationToken: this.generateVerificationToken(),
      emailVerificationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    });

    await user.save();

    // Generate tokens
    const tokens = generateTokenPair(user);

    // Return user data without sensitive information
    return {
      user: user.getPublicProfile(),
      ...tokens
    };
  }

  /**
   * Login user
   */
  async login(loginData: LoginData): Promise<AuthResponse> {
    const { email, password } = loginData;

    // Find user with password
    const user = await User.findOne({ email }).select('+passwordHash');
    if (!user) {
      throw createError('Invalid email or password', 401);
    }

    // Check if user is active
    if (!user.isActive) {
      throw createError('Account is deactivated', 401);
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw createError('Invalid email or password', 401);
    }

    // Update last login
    user.lastLoginAt = new Date();
    await user.save();

    // Generate tokens
    const tokens = generateTokenPair(user);

    return {
      user: user.getPublicProfile(),
      ...tokens
    };
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string; expiresIn: string }> {
    if (!refreshToken) {
      throw createError('Refresh token is required', 401);
    }

    try {
      // Verify refresh token and get user
      const user = await verifyRefreshToken(refreshToken);

      // Generate new token pair
      const tokens = generateTokenPair(user);

      return tokens;
    } catch (error) {
      throw createError('Invalid or expired refresh token', 401);
    }
  }

  /**
   * Logout user (invalidate refresh token)
   */
  async logout(): Promise<void> {
    // In a real application, you might want to:
    // 1. Add the token to a blacklist
    // 2. Store invalidated tokens in Redis
    // 3. Use a token versioning system

    // For now, we'll just return success
    // The client should discard the tokens
  }

  /**
   * Forgot password
   */
  async forgotPassword(email: string): Promise<void> {
    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal if user exists or not
      return;
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');

    user.passwordResetToken = resetTokenHash;
    user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await user.save();

    // TODO: Send password reset email
    // await emailService.sendPasswordResetEmail(user.email, resetToken);

    console.log(`Password reset token for ${email}: ${resetToken}`); // For development
  }

  /**
   * Reset password
   */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    if (!token) {
      throw createError('Reset token is required', 400);
    }

    // Hash the token to compare with stored hash
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    // Find user with valid reset token
    const user = await User.findOne({
      passwordResetToken: tokenHash,
      passwordResetExpires: { $gt: new Date() }
    });

    if (!user) {
      throw createError('Invalid or expired reset token', 400);
    }

    // Update password
    user.passwordHash = newPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save();

    // TODO: Send password reset confirmation email
    // await emailService.sendPasswordResetConfirmationEmail(user.email);
  }

  /**
   * Verify email
   */
  async verifyEmail(token: string): Promise<void> {
    if (!token) {
      throw createError('Verification token is required', 400);
    }

    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: new Date() }
    });

    if (!user) {
      throw createError('Invalid or expired verification token', 400);
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;

    await user.save();

    // TODO: Send email verification confirmation
    // await emailService.sendEmailVerifiedConfirmation(user.email);
  }

  /**
   * Resend verification email
   */
  async resendVerificationEmail(email: string): Promise<void> {
    const user = await User.findOne({ email });
    if (!user) {
      throw createError('User not found', 404);
    }

    if (user.isEmailVerified) {
      throw createError('Email is already verified', 400);
    }

    // Generate new verification token
    user.emailVerificationToken = this.generateVerificationToken();
    user.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await user.save();

    // TODO: Send verification email
    // await emailService.sendEmailVerification(user.email, user.emailVerificationToken);
  }

  /**
   * Change password
   */
  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    const user = await User.findById(userId).select('+passwordHash');
    if (!user) {
      throw createError('User not found', 404);
    }

    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      throw createError('Current password is incorrect', 400);
    }

    // Update password
    user.passwordHash = newPassword;
    await user.save();
  }

  /**
   * Update user profile
   */
  async updateProfile(userId: string, updateData: Partial<IUser>): Promise<any> {
    const user = await User.findById(userId);
    if (!user) {
      throw createError('User not found', 404);
    }

    // Update allowed fields
    const allowedFields = ['firstName', 'lastName', 'avatar', 'preferences'];
    const filteredData: any = {};

    allowedFields.forEach(field => {
      if (updateData[field as keyof IUser] !== undefined) {
        if (field === 'preferences') {
          filteredData[field] = { ...user.preferences, ...updateData[field] };
        } else {
          filteredData[field] = updateData[field as keyof IUser];
        }
      }
    });

    Object.assign(user, filteredData);
    await user.save();

    return user.getPublicProfile();
  }

  /**
   * Get user profile
   */
  async getProfile(userId: string): Promise<any> {
    const user = await User.findById(userId);
    if (!user) {
      throw createError('User not found', 404);
    }

    return user.getPublicProfile();
  }

  /**
   * Generate email verification token
   */
  private generateVerificationToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Get current user from request
   */
  getCurrentUser(req: AuthRequest): any {
    if (!req.user) {
      throw createError('User not authenticated', 401);
    }

    return req.user.getPublicProfile();
  }
}

export default new AuthService();