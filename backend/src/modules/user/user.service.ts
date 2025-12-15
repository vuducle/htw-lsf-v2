import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateUserDto, LoginUserDto } from './dto';
import * as bcrypt from 'bcryptjs';
import { ImageUtils } from '../../utils/image.utils';

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
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
      expiresIn: (process.env.JWT_EXPIRATION as any) || '15m',
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
}
