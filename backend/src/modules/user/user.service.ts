import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from '../../redis/redis.service';
import { EmailService } from '../../email/email.service';
import { CreateUserDto, LoginUserDto } from './dto';
import * as bcrypt from 'bcryptjs';
import { ImageUtils } from '../../utils/image.utils';

interface CachedUserLogin {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  hashedPassword: string;
}

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private redisService: RedisService,
    private emailService: EmailService,
  ) {}

  async createUser(createUserDto: CreateUserDto) {
    const { email, password, firstName, lastName } = createUserDto;

    // Check if user already exists
    const existingUser = await this.prisma.client.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user and automatically assign as Student
    const user = await this.prisma.client.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        //avatarUrl: avatarUrl || null,
        student: {
          create: {},
        },
      },
    });

    // Generate tokens
    const { accessToken, refreshToken } = await this.generateTokens(
      user.id,
      user.email,
    );

    // Save refresh token
    await this.prisma.client.user.update({
      where: { id: user.id },
      data: { refreshToken },
    });

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      //avatarUrl: user.avatarUrl,
      accessToken,
      refreshToken,
    };
  }

  async login(loginUserDto: LoginUserDto) {
    const { email, password } = loginUserDto;

    // Try to get cached user data first
    const cachedUser = await this.redisService.getCache<CachedUserLogin>(
      `login:${email}`,
    );
    if (cachedUser) {
      // Verify password still matches (security)
      const isPasswordValid = await bcrypt.compare(password, cachedUser.hashedPassword);
      if (isPasswordValid) {
        // Generate fresh tokens
        const { accessToken, refreshToken } = await this.generateTokens(
          cachedUser.id,
          cachedUser.email,
        );

        // Cache the login response
        await this.redisService.setUserSession(cachedUser.id, {
          id: cachedUser.id,
          email: cachedUser.email,
          firstName: cachedUser.firstName,
          lastName: cachedUser.lastName,
        });

        return {
          id: cachedUser.id,
          email: cachedUser.email,
          firstName: cachedUser.firstName,
          lastName: cachedUser.lastName,
          accessToken,
          refreshToken,
        };
      }
    }

    // Fetch from database if not cached
    const user = await this.prisma.client.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Cache user data for future logins (1 hour TTL)
    await this.redisService.setCache<CachedUserLogin>(`login:${email}`, {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      hashedPassword: user.password,
    }, 3600);

    // Generate tokens
    const { accessToken, refreshToken } = await this.generateTokens(
      user.id,
      user.email,
    );

    // Save refresh token and cache session
    await this.prisma.client.user.update({
      where: { id: user.id },
      data: { refreshToken },
    });

    // Cache user session
    await this.redisService.setUserSession(user.id, {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    });

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      accessToken,
      refreshToken,
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET || 'refresh-secret',
      });

      const user = await this.prisma.client.user.findUnique({
        where: { id: payload.sub },
      });

      if (!user || user.refreshToken !== refreshToken) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const { accessToken, refreshToken: newRefreshToken } =
        await this.generateTokens(user.id, user.email);

      await this.prisma.client.user.update({
        where: { id: user.id },
        data: { refreshToken: newRefreshToken },
      });

      return {
        accessToken,
        refreshToken: newRefreshToken,
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  private async generateTokens(userId: string, email: string) {
    const payload = { sub: userId, email };

    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET || 'secret',
      expiresIn: (process.env.JWT_EXPIRATION as any) || '30m',
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET || 'refresh-secret',
      expiresIn: (process.env.JWT_REFRESH_EXPIRATION as any) || '7d',
    });

    return { accessToken, refreshToken };
  }

  async getUserById(id: string) {
    return this.prisma.client.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        avatarUrl: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async uploadAvatar(userId: string, file?: Express.Multer.File) {
    // If no file provided, remove avatar
    if (!file) {
      return this.removeAvatar(userId);
    }

    // Validate file type
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedMimes.includes(file.mimetype)) {
      throw new BadRequestException(
        'Invalid file type. Only JPEG, PNG, and WebP are allowed',
      );
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new BadRequestException('File size must be less than 5MB');
    }

    try {
      // Get user
      const user = await this.prisma.client.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new BadRequestException('User not found');
      }

      // Delete old avatar if it exists and is not a fallback
      if (user.avatarUrl && !user.avatarUrl.includes('ui-avatars.com')) {
        ImageUtils.deleteAvatar(user.avatarUrl);
      }

      // Process and save new avatar
      const avatarUrl = await ImageUtils.processAvatar(
        file.buffer,
        file.originalname,
      );

      // Update user with new avatar URL
      const updatedUser = await this.prisma.client.user.update({
        where: { id: userId },
        data: { avatarUrl },
      });

      return {
        id: updatedUser.id,
        email: updatedUser.email,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        avatarUrl: updatedUser.avatarUrl,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to upload avatar');
    }
  }

  async removeAvatar(userId: string) {
    try {
      // Get user
      const user = await this.prisma.client.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new BadRequestException('User not found');
      }

      // Delete old avatar if it exists and is not a fallback
      if (user.avatarUrl && !user.avatarUrl.includes('ui-avatars.com')) {
        ImageUtils.deleteAvatar(user.avatarUrl);
      }

      // Update user with null avatar URL
      const updatedUser = await this.prisma.client.user.update({
        where: { id: userId },
        data: { avatarUrl: null },
      });

      return {
        message: 'Avatar removed successfully',
        id: updatedUser.id,
        email: updatedUser.email,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        avatarUrl: null,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to remove avatar');
    }
  }

  /**
   * Get avatar URL for user (with fallback to ui-avatars)
   */
  getAvatarUrl(user: {
    avatarUrl: string | null;
    firstName: string;
    lastName: string;
  }): string {
    if (user.avatarUrl) {
      return user.avatarUrl;
    }
    return ImageUtils.generateFallbackAvatar(user.firstName, user.lastName);
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
    newPasswordConfirm: string,
  ) {
    // Validate passwords match
    if (newPassword !== newPasswordConfirm) {
      throw new BadRequestException('New passwords do not match');
    }

    // Validate new password is different from current
    if (currentPassword === newPassword) {
      throw new BadRequestException(
        'New password must be different from current password',
      );
    }

    // Get user
    const user = await this.prisma.client.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user password
    await this.prisma.client.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return {
      message: 'Password changed successfully',
    };
  }

  async forgotPassword(email: string) {
    const user = await this.prisma.client.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Don't reveal if email exists or not (security best practice)
      return {
        message: 'If an account with that email exists, a password reset link has been sent',
      };
    }

    // Generate password reset token (valid for 1 hour)
    const resetToken = this.jwtService.sign(
      { email: user.email, sub: user.id, type: 'reset' },
      { expiresIn: '1h', secret: process.env.JWT_SECRET },
    );

    // Store reset token in Redis with 1 hour expiry
    await this.redisService.setCache<{ email: string; userId: string }>(
      `password-reset:${resetToken}`,
      {
        email: user.email,
        userId: user.id,
      },
      3600, // 1 hour
    );

    // Build reset link
    const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;

    // Send email
    try {
      await this.emailService.sendPasswordResetEmail(
        user.email,
        user.firstName,
        resetToken,
        resetLink,
      );
    } catch (error) {
      console.error('Failed to send password reset email:', error);
      // Don't fail the request even if email fails (can be logged/monitored)
    }

    return {
      message: 'If an account with that email exists, a password reset link has been sent',
    };
  }

  async resetPassword(token: string, newPassword: string, newPasswordConfirm: string) {
    // Validate passwords match
    if (newPassword !== newPasswordConfirm) {
      throw new BadRequestException('New passwords do not match');
    }

    // Validate token format
    if (!token || typeof token !== 'string') {
      throw new BadRequestException('Invalid reset token');
    }

    try {
      // Verify token
      const decoded = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET,
      }) as any;

      if (decoded.type !== 'reset') {
        throw new BadRequestException('Invalid token type');
      }

      // Check if token exists in Redis (not already used)
      const resetData = await this.redisService.getCache<{ email: string; userId: string }>(
        `password-reset:${token}`,
      );

      if (!resetData) {
        throw new BadRequestException('Password reset token has expired or is invalid');
      }

      // Get user
      const user = await this.prisma.client.user.findUnique({
        where: { id: decoded.sub },
      });

      if (!user) {
        throw new BadRequestException('User not found');
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Update password
      await this.prisma.client.user.update({
        where: { id: user.id },
        data: { password: hashedPassword },
      });

      // Invalidate token by removing from Redis
      await this.redisService.invalidateCache(`password-reset:${token}`);

      // Clear any cached login data for this user
      await this.redisService.invalidateCache(`login:${user.email}`);

      return {
        message: 'Password reset successfully. You can now login with your new password.',
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Invalid or expired password reset token');
    }
  }
}
