import bcrypt from 'bcryptjs';
import { prisma } from '../config/db.js';
import { signToken, signRefreshToken } from '../utils/jwt.js';

export class AuthService {
  static async login(email: string, password: string) {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user) {
      throw new Error('Invalid email or password');
    }

    if (!user.isActive) {
      throw new Error('Account deactivated. Please contact an Administrator.');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new Error('Invalid email or password');
    }

    const token = signToken({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    const refreshToken = signRefreshToken({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    // Log Activity
    await prisma.activityLog.create({
      data: {
        userId: user.id,
        userName: user.name,
        userRole: user.role,
        entity: 'Auth',
        action: 'LOGIN',
        details: `User ${user.name} logged in successfully`,
      },
    });

    return {
      token,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }

  static async getCurrentUser(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }

  static async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error('User not found');

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) throw new Error('Current password is incorrect');

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
        where: { id: userId },
        data: { password: hashedPassword },
    });

    return { message: 'Password updated successfully' };
  }

  static async register(name: string, email: string, password: string) {
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase().trim(),
        name,
        password: hashedPassword,
        role: 'ADMIN',
      },
    });

    const token = signToken({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    const refreshToken = signRefreshToken({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    await prisma.activityLog.create({
      data: {
        userId: user.id,
        userName: user.name,
        userRole: user.role,
        entity: 'Auth',
        action: 'REGISTER',
        details: `User ${user.name} registered successfully`,
      },
    });

    return {
      token,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }

  static async forgotPassword(email: string) {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (user) {
      // Typically we would send an email here with a reset token.
      // For this project, we'll just log an activity and return success.
      await prisma.activityLog.create({
        data: {
          userId: user.id,
          userName: user.name,
          userRole: user.role,
          entity: 'Auth',
          action: 'FORGOT_PASSWORD',
          details: `User ${user.name} requested a password reset`,
        },
      });
    }

    // We always return success so as not to leak whether an email exists or not
    return { message: 'If an account with that email exists, we have sent a password reset link.' };
  }

  static async refreshSession(refreshToken: string) {
    try {
      const { verifyRefreshToken } = await import('../utils/jwt.js');
      const decoded = verifyRefreshToken(refreshToken);
      const user = await prisma.user.findUnique({ where: { id: decoded.userId } });

      if (!user || !user.isActive) {
        throw new Error('Invalid or disabled account');
      }

      const token = signToken({
        userId: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      });

      const newRefreshToken = signRefreshToken({
        userId: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      });

      return {
        token,
        refreshToken: newRefreshToken,
      };
    } catch (err) {
      throw new Error('Invalid refresh token');
    }
  }
}
