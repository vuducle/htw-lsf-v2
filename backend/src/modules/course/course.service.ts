import {
  ConflictException,
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { GetAllCoursesQueryDto, UpdateCourseDto } from './dto';
import { CreateCourseDto } from './dto';

@Injectable()
export class CourseService {
  constructor(private readonly prisma: PrismaService) {}

  async create(teacherId: string, createCourseDto: CreateCourseDto) {
    const { schedule, ...courseData } = createCourseDto;

    const existingCourse = await this.prisma.client.course.findUnique({
      where: {
        code: courseData.code,
      },
    });

    if (existingCourse) {
      throw new ConflictException('Course with this code already exists');
    }

    return this.prisma.client.$transaction(async (prisma) => {
      const course = await prisma.course.create({
        data: {
          ...courseData,
          teacher: {
            connect: {
              id: teacherId,
            },
          },
        },
      });

      if (schedule && schedule.length > 0) {
        await prisma.schedule.createMany({
          data: schedule.map((scheduleItem) => ({
            ...scheduleItem,
            courseId: course.id,
          })),
        });
      }

      return course;
    });
  }

  async update(teacherId: string, code: string, updateDto: UpdateCourseDto) {
    const { schedule, ...courseData } = updateDto as any;

    // ensure course exists
    const existing = await this.prisma.client.course.findUnique({
      where: { code },
    });

    if (!existing) {
      throw new NotFoundException(`Course with code ${code} not found`);
    }

    // check ownership: course.teacherId should match teacherId
    if (existing.teacherId !== teacherId) {
      throw new NotFoundException('Course not found for this teacher');
    }

    return this.prisma.client.$transaction(async (prisma) => {
      const updated = await prisma.course.update({
        where: { code },
        data: {
          ...courseData,
        },
      });

      if (schedule) {
        // remove old schedule entries and insert new ones
        await prisma.schedule.deleteMany({ where: { courseId: updated.id } });
        if (schedule.length > 0) {
          await prisma.schedule.createMany({
            data: schedule.map((s: any) => ({ ...s, courseId: updated.id })),
          });
        }
      }

      return updated;
    });
  }

  async remove(teacherId: string, code: string) {
    const existing = await this.prisma.client.course.findUnique({
      where: { code },
    });

    if (!existing) {
      throw new NotFoundException(`Course with code ${code} not found`);
    }

    if (existing.teacherId !== teacherId) {
      throw new ForbiddenException('You are not the owner of this course');
    }

    return this.prisma.client.$transaction(async (prisma) => {
      // Ensure schedules are removed first to avoid FK issues (DB may cascade)
      await prisma.schedule.deleteMany({ where: { courseId: existing.id } });
      const deleted = await prisma.course.delete({ where: { code } });
      return deleted;
    });
  }

  async getAllCourses(query: GetAllCoursesQueryDto) {
    const {
      page = 1,
      limit = 10,
      search,
      teacherId,
      code,
      startDateFrom,
      endDateTo,
      sortBy = 'createdAt',
      sortOrder = 'asc',
    } = query;
    const skip = (page - 1) * limit;

    const where: any = {};

    // Filter by teacher ID
    if (teacherId) {
      where.teacherId = teacherId;
    }

    // Filter by course code (exact match)
    if (code) {
      where.code = {
        equals: code.toUpperCase(),
        mode: 'insensitive',
      };
    }

    // Filter by date range
    if (startDateFrom || endDateTo) {
      where.AND = [];
      if (startDateFrom) {
        where.AND.push({
          startDate: {
            gte: new Date(startDateFrom),
          },
        });
      }
      if (endDateTo) {
        where.AND.push({
          endDate: {
            lte: new Date(endDateTo),
          },
        });
      }
    }

    // Search in title, code, and description (case-insensitive)
    if (search) {
      where.OR = [
        {
          title: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          code: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          description: {
            contains: search,
            mode: 'insensitive',
          },
        },
      ];
    }

    // Build sort object
    const orderBy: any = {};
    const sortField = sortBy || 'createdAt';
    const order = (sortOrder || 'asc').toLowerCase() as 'asc' | 'desc';
    orderBy[sortField] = order;

    const [courses, total] = await this.prisma.client.$transaction([
      this.prisma.client.course.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          teacher: {
            select: {
              id: true,
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                  email: true,
                },
              },
            },
          },
        },
      }),
      this.prisma.client.course.count({ where }),
    ]);

    return {
      data: courses,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNextPage: skip + limit < total,
      hasPrevPage: page > 1,
    };
  }

  async getCourseByCode(code: string) {
    const course = await this.prisma.client.course.findUnique({
      where: {
        code,
      },
    });

    if (!course) {
      throw new NotFoundException(`Course with code ${code} not found`);
    }

    return course;
  }

  async getEnrolledStudents(courseId: string) {
    const course = await this.prisma.client.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    const enrollments = await this.prisma.client.enrollment.findMany({
      where: { courseId },
      include: {
        student: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    return {
      courseId,
      courseTitle: course.title,
      totalEnrolled: enrollments.length,
      students: enrollments.map((e) => ({
        enrollmentId: e.id,
        studentId: e.student.id,
        user: e.student.user,
        enrolledAt: e.createdAt,
      })),
    };
  }

  /**
   * Get course schedule details
   */
  async getCourseSchedules(courseId: string) {
    const course = await this.prisma.client.course.findUnique({
      where: { id: courseId },
      include: {
        schedule: {
          orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
        },
      },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    return {
      course: {
        id: course.id,
        title: course.title,
        code: course.code,
        description: course.description,
        room: course.room,
        startDate: course.startDate,
        endDate: course.endDate,
      },
      schedules: course.schedule,
    };
  }

  /**
   * Get course statistics including enrollment count and grade statistics
   */
  async getCourseStatistics(courseId: string) {
    const course = await this.prisma.client.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    // Get enrollment count
    const enrollmentCount = await this.prisma.client.enrollment.count({
      where: { courseId },
    });

    // Get grades statistics
    const grades = await this.prisma.client.grade.findMany({
      where: { courseId },
      select: { grade: true },
    });

    // Calculate grade statistics
    let gradeStats = {
      totalGraded: 0,
      averageGrade: 0,
      highestGrade: 0,
      lowestGrade: 0,
    };

    if (grades.length > 0) {
      const gradeValues = grades.map((g) => g.grade);
      const sum = gradeValues.reduce((acc, val) => acc + val, 0);
      gradeStats = {
        totalGraded: grades.length,
        averageGrade: parseFloat((sum / gradeValues.length).toFixed(2)),
        highestGrade: Math.max(...gradeValues),
        lowestGrade: Math.min(...gradeValues),
      };
    }

    return {
      courseId: course.id,
      courseTitle: course.title,
      courseCode: course.code,
      enrollmentStats: {
        totalEnrolled: enrollmentCount,
        ungraded: enrollmentCount - gradeStats.totalGraded,
      },
      gradeStats,
    };
  }
}
