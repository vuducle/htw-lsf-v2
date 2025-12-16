import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateGradeDto, UpdateGradeDto, GetMyCoursesQueryDto } from './dto';

@Injectable()
export class TeacherService {
  // Use this.prisma.client to access the Prisma Client
  constructor(private prisma: PrismaService) {}

  async getTeacherByUserId(userId: string) {
    return this.prisma.client.teacher.findUnique({
      where: { userId },
    });
  }

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

  async getMyTeacherProfile(userId: string) {
    const teacher = await this.prisma.client.teacher.findUnique({
      where: { userId },
      include: { user: true },
    });

    if (!teacher) {
      throw new NotFoundException('Teacher profile not found');
    }

    return teacher;
  }

  async getMyCourses(userId: string, query: GetMyCoursesQueryDto) {
    const { page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const teacher = await this.prisma.client.teacher.findUnique({
      where: { userId },
    });

    if (!teacher) {
      throw new NotFoundException('Teacher profile not found');
    }

    const [courses, total] = await this.prisma.client.$transaction([
      this.prisma.client.course.findMany({
        where: { teacherId: teacher.id },
        skip,
        take: limit,
        include: { schedule: true },
      }),
      this.prisma.client.course.count({ where: { teacherId: teacher.id } }),
    ]);

    return { data: courses, total, page, limit };
  }

  async getEnrollmentsByCourse(userId: string, courseId: string) {
    const teacher = await this.prisma.client.teacher.findUnique({
      where: { userId },
    });

    if (!teacher) {
      throw new NotFoundException('Teacher profile not found');
    }

    const course = await this.prisma.client.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    if (course.teacherId !== teacher.id) {
      throw new ForbiddenException('You do not own this course');
    }

    const enrollments = await this.prisma.client.enrollment.findMany({
      where: { courseId },
      include: { student: { include: { user: true } } },
    });

    return enrollments;
  }

  async assignGrade(userId: string, createGradeDto: CreateGradeDto) {
    const { studentId, courseId, grade } = createGradeDto;

    const teacher = await this.prisma.client.teacher.findUnique({
      where: { userId },
    });

    if (!teacher) {
      throw new NotFoundException('Teacher profile not found');
    }

    const course = await this.prisma.client.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    if (course.teacherId !== teacher.id) {
      throw new ForbiddenException('You do not own this course');
    }

    // Check if student is enrolled
    const enrollment = await this.prisma.client.enrollment.findFirst({
      where: { studentId, courseId },
    });

    if (!enrollment) {
      throw new BadRequestException('Student is not enrolled in this course');
    }

    // Check if grade already exists
    const existingGrade = await this.prisma.client.grade.findFirst({
      where: { studentId, courseId, teacherId: teacher.id },
    });

    if (existingGrade) {
      throw new BadRequestException('Grade already exists for this student/course. Use PATCH to update.');
    }

    return this.prisma.client.grade.create({
      data: {
        studentId,
        courseId,
        teacherId: teacher.id,
        grade,
      },
      include: { student: { include: { user: true } }, course: true },
    });
  }

  async updateGrade(userId: string, gradeId: string, updateGradeDto: UpdateGradeDto) {
    const { grade } = updateGradeDto;

    const teacher = await this.prisma.client.teacher.findUnique({
      where: { userId },
    });

    if (!teacher) {
      throw new NotFoundException('Teacher profile not found');
    }

    const existingGrade = await this.prisma.client.grade.findUnique({
      where: { id: gradeId },
    });

    if (!existingGrade) {
      throw new NotFoundException('Grade not found');
    }

    if (existingGrade.teacherId !== teacher.id) {
      throw new ForbiddenException('You cannot update this grade');
    }

    return this.prisma.client.grade.update({
      where: { id: gradeId },
      data: { grade },
      include: { student: { include: { user: true } }, course: true },
    });
  }

  async getGradesByCourse(userId: string, courseId: string) {
    const teacher = await this.prisma.client.teacher.findUnique({
      where: { userId },
    });

    if (!teacher) {
      throw new NotFoundException('Teacher profile not found');
    }

    const course = await this.prisma.client.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    if (course.teacherId !== teacher.id) {
      throw new ForbiddenException('You do not own this course');
    }

    const grades = await this.prisma.client.grade.findMany({
      where: { courseId },
      include: { student: { include: { user: true } } },
    });

    // Calculate course statistics
    const statistics = await this.calculateCourseStatistics(courseId);

    return {
      grades,
      statistics,
    };
  }

  async calculateCourseStatistics(courseId: string) {
    const grades = await this.prisma.client.grade.findMany({
      where: { courseId },
      select: { grade: true },
    });

    if (grades.length === 0) {
      return {
        totalStudents: 0,
        averageGrade: 0,
        highestGrade: 0,
        lowestGrade: 0,
        distribution: {
          'between1and2': 0,
          'between2and3': 0,
          'between3and4': 0,
          'between4and5': 0,
        },
      };
    }

    const gradeValues = grades.map((g) => g.grade);
    const sum = gradeValues.reduce((acc, val) => acc + val, 0);
    const average = parseFloat((sum / gradeValues.length).toFixed(2));
    const highest = Math.max(...gradeValues);
    const lowest = Math.min(...gradeValues);

    // Calculate grade distribution by ranges
    const distribution = {
      'between1and2': gradeValues.filter((g) => g > 1 && g <= 2).length,
      'between2and3': gradeValues.filter((g) => g > 2 && g <= 3).length,
      'between3and4': gradeValues.filter((g) => g > 3 && g <= 4).length,
      'between4and5': gradeValues.filter((g) => g > 4 && g <= 5).length,
    };

    return {
      totalStudents: grades.length,
      averageGrade: average,
      highestGrade: highest,
      lowestGrade: lowest,
      distribution,
    };
  }
}