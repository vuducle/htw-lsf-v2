import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class TeacherService {
  // Use this.prisma.client to access the Prisma Client
  constructor(private prisma: PrismaService) {}

  async updateUserRole(teacherId: string, userId: string, isTeacher: boolean) {
    // Verify that the requester is actually a teacher
    const requesterTeacher = await this.prisma.client.teacher.findUnique({
      where: { userId: teacherId },
      include: { user: true },
    });

    if (!requesterTeacher) {
      throw new BadRequestException('Only teachers can assign roles');
    }

    // Get the target user
    const targetUser = await this.prisma.client.user.findUnique({
      where: { id: userId },
      include: { teacher: true, student: true },
    });

    if (!targetUser) {
      throw new BadRequestException('User not found');
    }

    // Prevent self-role changes
    if (teacherId === userId) {
      throw new BadRequestException('Cannot modify your own teacher role');
    }

    if (isTeacher) {
      // Grant teacher role
      if (targetUser.teacher) {
        throw new BadRequestException('User is already a teacher');
      }

      // Create teacher profile
      await this.prisma.client.teacher.create({
        data: {
          userId,
        },
      });

      // Delete student profile if it exists
      if (targetUser.student) {
        await this.prisma.client.student.delete({
          where: { id: targetUser.student.id },
        });
      }

      return {
        message: `${targetUser.firstName} ${targetUser.lastName} is now a teacher`,
        user: {
          id: targetUser.id,
          email: targetUser.email,
          firstName: targetUser.firstName,
          lastName: targetUser.lastName,
          isTeacher: true,
          isStudent: false,
        },
      };
    } else {
      // Revoke teacher role
      if (!targetUser.teacher) {
        throw new BadRequestException('User is not a teacher');
      }

      // Delete teacher profile
      await this.prisma.client.teacher.delete({
        where: { id: targetUser.teacher.id },
      });

      // Create student profile if it doesn't exist
      if (!targetUser.student) {
        await this.prisma.client.student.create({
          data: {
            userId,
          },
        });
      }

      return {
        message: `${targetUser.firstName} ${targetUser.lastName} is no longer a teacher`,
        user: {
          id: targetUser.id,
          email: targetUser.email,
          firstName: targetUser.firstName,
          lastName: targetUser.lastName,
          isTeacher: false,
          isStudent: true,
        },
      };
    }
  }
}
