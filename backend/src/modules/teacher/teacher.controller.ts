import { Controller, Patch, Body, UseGuards, Request } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { TeacherService } from './teacher.service';
import { UpdateUserRoleDto } from './dto';

@ApiTags('Teachers')
@Controller('teachers')
export class TeacherController {
  constructor(private readonly teacherService: TeacherService) {}

  @Patch('users/role')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Grant or revoke teacher role (Teacher only)',
  })
  @ApiBody({ type: UpdateUserRoleDto })
  @ApiResponse({
    status: 200,
    description: 'User role updated successfully',
    schema: {
      example: {
        message: 'Armin Dorri is now a teacher',
        user: {
          id: 'clz123xyz',
          email: 'armin.dorri@example.com',
          firstName: 'Armin',
          lastName: 'Dorri',
          isTeacher: true,
          isStudent: false,
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description:
      'Only teachers can assign roles, or user not found, or already has role',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async updateUserRole(
    @Request() req,
    @Body() updateUserRoleDto: UpdateUserRoleDto,
  ) {
    return this.teacherService.updateUserRole(
      req.user.sub,
      updateUserRoleDto.userId,
      updateUserRoleDto.isTeacher,
    );
  }
}
