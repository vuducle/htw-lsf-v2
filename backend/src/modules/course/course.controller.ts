import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  Put,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { CourseService } from './course.service';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CreateCourseDto, GetAllCoursesQueryDto } from './dto';
import { TeacherAuthGuard } from '../../guards/teacher-auth.guard';
import { UpdateCourseDto } from './dto';

@ApiTags('Courses')
@Controller('courses')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  @Post()
  @UseGuards(TeacherAuthGuard)
  @ApiOperation({ summary: 'Create a new course' })
  @ApiResponse({
    status: 201,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 409,
    description: 'Course with this code already exists',
  })
  async create(@Body() createCourseDto: CreateCourseDto, @Req() req) {
    return this.courseService.create(req.teacher.id, createCourseDto);
  }

  @Put(':code')
  @UseGuards(TeacherAuthGuard)
  @ApiOperation({ summary: 'Update a course (teacher only, must own course)' })
  @ApiResponse({ status: 200, description: 'Course updated' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Course not found' })
  async updateCourse(
    @Param('code') code: string,
    @Body() updateDto: UpdateCourseDto,
    @Req() req,
  ) {
    return this.courseService.update(req.teacher.id, code, updateDto);
  }

  @ApiResponse({
    status: 200,
    type: GetAllCoursesQueryDto,
    schema: {
      example: {
        id: 'cmj6vcg7t0004u7rb087ccqah',
        title: 'Introduction to Web Development',
        description: 'Learn the fundamentals of Web Development',
        code: 'CS101',
        teacherId: 'cmj6vcg5r0001u7rbprye5aev',
        startDate: '2025-10-01T00:00:00.000Z',
        endDate: '2026-03-31T00:00:00.000Z',
        room: 'Room 101',
        createdAt: '2025-12-15T08:05:20.535Z',
        updatedAt: '2025-12-15T08:05:20.535Z',
      },
    },
  })
  @Delete(':code')
  @UseGuards(TeacherAuthGuard)
  @ApiOperation({ summary: 'Delete a course (teacher only, must own course)' })
  @ApiResponse({ status: 200, description: 'Course deleted' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Course not found' })
  async deleteCourse(@Param('code') code: string, @Req() req) {
    return this.courseService.remove(req.teacher.id, code);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all courses with advanced filtering and search',
    description:
      'Retrieve courses with advanced filtering by teacher, code, date range, and search functionality. Supports sorting and pagination.',
  })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of courses',
    schema: {
      example: {
        data: [
          {
            id: 'cmj6vcg7t0004u7rb087ccqah',
            title: 'Introduction to Web Development',
            description: 'Learn the fundamentals of Web Development',
            code: 'CS101',
            teacherId: 'cmj6vcg5r0001u7rbprye5aev',
            startDate: '2025-10-01T00:00:00.000Z',
            endDate: '2026-03-31T00:00:00.000Z',
            room: 'Room 101',
            createdAt: '2025-12-15T08:05:20.535Z',
            updatedAt: '2025-12-15T08:05:20.535Z',
            teacher: {
              id: 'cmj6vcg5r0001u7rbprye5aev',
              user: {
                firstName: 'Julia',
                lastName: 'Nguyen',
                email: 'julia.nguyen@example.com',
              },
            },
          },
        ],
        total: 25,
        page: 1,
        limit: 10,
        totalPages: 3,
        hasNextPage: true,
        hasPrevPage: false,
      },
    },
  })
  async getAllCourses(@Query() query: GetAllCoursesQueryDto) {
    return this.courseService.getAllCourses(query);
  }

  @Get(':code')
  @ApiOperation({ summary: 'Get course by code' })
  @ApiResponse({
    status: 200,
    type: GetAllCoursesQueryDto,
    schema: {
      example: {
        id: 'cmj6vcg7t0004u7rb087ccqah',
        title: 'Introduction to Game Engines',
        description: 'Learn the fundamentals of Game Engines',
        code: 'CS101',
        teacherId: 'cmj6vcg5r0001u7rbprye5aev',
        startDate: '2025-10-01T00:00:00.000Z',
        endDate: '2026-03-31T00:00:00.000Z',
        room: 'Room 101',
        createdAt: '2025-12-15T08:05:20.535Z',
        updatedAt: '2025-12-15T08:05:20.535Z',
      },
    },
  })
  async getCourseByCode(@Param('code') code: string) {
    return this.courseService.getCourseByCode(code);
  }

  @Get(':courseId/enrolled-students')
  @ApiOperation({ summary: 'Get all students enrolled in a course' })
  @ApiResponse({ status: 200, description: 'List of enrolled students' })
  @ApiResponse({ status: 404, description: 'Course not found' })
  async getEnrolledStudents(@Param('courseId') courseId: string) {
    return this.courseService.getEnrolledStudents(courseId);
  }

  @Get(':courseId/schedules')
  @ApiOperation({
    summary: 'Get course schedule details',
    description:
      'Retrieve all scheduled sessions for a course including day, time, and room information',
  })
  @ApiResponse({
    status: 200,
    description: 'Course and schedules details',
    schema: {
      example: {
        course: {
          id: 'cmj6vcg7t0004u7rb087ccqah',
          title: 'Introduction to Web Development',
          code: 'CS101',
          description: 'Learn the fundamentals of Web Development',
          room: 'Room 101',
          startDate: '2025-10-01T00:00:00.000Z',
          endDate: '2026-03-31T00:00:00.000Z',
        },
        schedules: [
          {
            id: 'schedule123',
            courseId: 'cmj6vcg7t0004u7rb087ccqah',
            dayOfWeek: 1,
            startTime: '10:00',
            endTime: '12:00',
            room: null,
            createdAt: '2025-12-15T08:05:20.535Z',
            updatedAt: '2025-12-15T08:05:20.535Z',
          },
          {
            id: 'schedule124',
            courseId: 'cmj6vcg7t0004u7rb087ccqah',
            dayOfWeek: 3,
            startTime: '14:00',
            endTime: '16:00',
            room: 'A2.1',
            createdAt: '2025-12-15T08:05:20.535Z',
            updatedAt: '2025-12-15T08:05:20.535Z',
          },
        ],
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Course not found' })
  async getCourseSchedules(@Param('courseId') courseId: string) {
    return this.courseService.getCourseSchedules(courseId);
  }

  @Get(':courseId/statistics')
  @ApiOperation({
    summary: 'Get course statistics',
    description:
      'Get enrollment count and grade statistics (average, highest, lowest) for a course',
  })
  @ApiResponse({
    status: 200,
    description: 'Course statistics',
    schema: {
      example: {
        courseId: 'cmj6vcg7t0004u7rb087ccqah',
        courseTitle: 'Introduction to Web Development',
        courseCode: 'CS101',
        enrollmentStats: {
          totalEnrolled: 25,
          ungraded: 3,
        },
        gradeStats: {
          totalGraded: 22,
          averageGrade: 3.7,
          highestGrade: 5.0,
          lowestGrade: 2.1,
        },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Course not found' })
  async getCourseStatistics(@Param('courseId') courseId: string) {
    return this.courseService.getCourseStatistics(courseId);
  }
}
