import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { CourseService } from './course.service';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { ApiBearerAuth } from '@nestjs/swagger/dist/decorators/api-bearer.decorator';
import { ApiOperation } from "@nestjs/swagger";

@Controller('courses')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  @Get()
  @ApiOperation({ summary: 'Get all courses' })
  async getAllCourses() {
    return this.courseService.getAllCourses();
  }

  @Get(':code')
  @ApiOperation({ summary: 'Get course by code' })
  async getCourseByCode(@Param('code') code: string) {
    return this.courseService.getCourseByCode(code);
  }
}
