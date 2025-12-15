import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CourseService {
  constructor(private readonly prisma: PrismaService) {}

  async getAllCourses() {
    return this.prisma.client.course.findMany();
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

  }
