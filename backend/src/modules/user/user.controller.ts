import {
  Controller,
  Post,
  Put,
  Patch,
  Get,
  Body,
  UseGuards,
  Request,
  BadRequestException,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Throttle } from '@nestjs/throttler';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiBody,
  ApiConsumes,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { UserService } from './user.service';
import {
  CreateUserDto,
  LoginUserDto,
  UpdateUserDto,
  UpdateAvatarDto,
  ChangePasswordDto,
  ForgotPasswordDto,
  ResetPasswordDto,
} from './dto';

@ApiTags('Authentication')
@Controller('auth')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('signup')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @ApiOperation({ summary: 'Register a new user' })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({
    status: 201,
    description: 'User successfully registered',
    schema: {
      example: {
        id: 1,
        email: 'triesnha.ameilya@example.com',
        firstName: 'Triesnha',
        lastName: 'Ameilya',
        avatarUrl: 'https://api.example.com/avatars/triesnha-ameilya.jpg',
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'User with this email already exists or validation failed',
  })
  async signup(@Body() createUserDto: CreateUserDto) {
    return this.userService.createUser(createUserDto);
  }

  @Post('login')
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @ApiOperation({ summary: 'Login user' })
  @ApiBody({ type: LoginUserDto })
  @ApiResponse({
    status: 200,
    description: 'User successfully logged in',
    schema: {
      example: {
        id: 1,
        email: 'julia.nguyen@example.com',
        firstName: 'Julia',
        lastName: 'Nguyen',
        //avatarUrl: 'https://api.example.com/avatars/julia-nguyen.jpg',
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid credentials',
  })
  async login(@Body() loginUserDto: LoginUserDto) {
    return this.userService.login(loginUserDto);
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiBody({
    schema: {
      example: {
        refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'New tokens generated',
    schema: {
      example: {
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid refresh token',
  })
  async refresh(@Body('refreshToken') refreshToken: string) {
    if (!refreshToken) {
      throw new BadRequestException('Refresh token is required');
    }
    return this.userService.refreshToken(refreshToken);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get current user profile',
    description: 'Retrieve the authenticated user profile information',
  })
  @ApiResponse({
    status: 200,
    description: 'Current user profile',
    schema: {
      example: {
        id: 'clz123xyz',
        email: 'user@example.com',
        firstName: 'Julia',
        lastName: 'Nguyen',
        avatarUrl: '/uploads/avatars/avatar_1702647000000_abc123.webp',
        createdAt: '2025-12-15T08:05:20.535Z',
        updatedAt: '2025-12-15T08:05:20.535Z',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid or missing JWT token',
  })
  async getProfile(@Request() req) {
    return this.userService.getUserById(req.user.sub);
  }

  @Put('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update user profile',
    description:
      'Update user profile information including email, firstName, and lastName. Only the authenticated user can update their own profile. All fields are optional - only provide the fields you want to update.',
  })
  @ApiBody({
    type: UpdateUserDto,
    description: 'Profile update data (all fields optional)',
    examples: {
      partial: {
        description: 'Update only firstName',
        value: {
          firstName: 'Denis',
        },
      },
      full: {
        description: 'Update all fields',
        value: {
          email: 'denis.kunz@example.com',
          firstName: 'Denis',
          lastName: 'Kunz',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Profile updated successfully',
    schema: {
      example: {
        id: 'clz123xyz',
        email: 'denis.kunz@example.com',
        firstName: 'Denis',
        lastName: 'Kunz',
        avatarUrl: '/uploads/avatars/avatar_1702647000000_abc123.webp',
        createdAt: '2025-12-15T08:05:20.535Z',
        updatedAt: '2025-12-16T13:25:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error or email already in use',
    schema: {
      example: {
        statusCode: 400,
        message: 'Email is already in use',
        error: 'Bad Request',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid or missing JWT token',
    schema: {
      example: {
        statusCode: 401,
        message: 'Unauthorized',
      },
    },
  })
  async updateProfile(
    @Request() req,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.userService.updateProfile(req.user.sub, updateUserDto);
  }

  @Put('avatar')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('avatar'))
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary:
      'Upload, update or remove user avatar. Send file to upload, empty body to remove.',
  })
  @ApiBody({
    description:
      'Avatar image file (optional). If not provided, avatar will be removed.',
    type: UpdateAvatarDto,
    required: false,
  })
  @ApiResponse({
    status: 200,
    description: 'Avatar successfully uploaded or removed',
    schema: {
      oneOf: [
        {
          example: {
            id: 'clz123xyz',
            email: 'denis.kunz@example.com',
            firstName: 'Denis',
            lastName: 'Kunz',
            avatarUrl: '/uploads/avatars/avatar_1702647000000_abc123.webp',
          },
        },
        {
          example: {
            message: 'Avatar removed successfully',
            id: 'clz123xyz',
            email: 'denis.kunz@example.com',
            firstName: 'Denis',
            lastName: 'Kunz',
            avatarUrl: null,
          },
        },
      ],
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid file or file too large',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async uploadAvatar(
    @Request() req,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.userService.uploadAvatar(req.user.sub, file);
  }

  @Patch('change-password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Change user password' })
  @ApiBody({ type: ChangePasswordDto })
  @ApiResponse({
    status: 200,
    description: 'Password changed successfully',
    schema: {
      example: {
        message: 'Password changed successfully',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description:
      'Passwords do not match, new password must be different, or validation failed',
  })
  @ApiResponse({
    status: 401,
    description: 'Current password is incorrect or unauthorized',
  })
  async changePassword(
    @Request() req,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    const { currentPassword, newPassword, newPasswordConfirm } =
      changePasswordDto;
    return this.userService.changePassword(
      req.user.sub,
      currentPassword,
      newPassword,
      newPasswordConfirm,
    );
  }

  @Post('forgot-password')
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @ApiOperation({ summary: 'Request password reset email' })
  @ApiBody({ type: ForgotPasswordDto })
  @ApiResponse({
    status: 200,
    description: 'If email exists, password reset link has been sent',
    schema: {
      example: {
        message: 'If an account with that email exists, a password reset link has been sent',
      },
    },
  })
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.userService.forgotPassword(forgotPasswordDto.email);
  }

  @Post('reset-password')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @ApiOperation({ summary: 'Reset password with token' })
  @ApiBody({ type: ResetPasswordDto })
  @ApiResponse({
    status: 200,
    description: 'Password reset successfully',
    schema: {
      example: {
        message: 'Password reset successfully. You can now login with your new password.',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid or expired token, or password validation failed',
  })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    const { token, newPassword, newPasswordConfirm } = resetPasswordDto;
    return this.userService.resetPassword(token, newPassword, newPasswordConfirm);
  }
}
