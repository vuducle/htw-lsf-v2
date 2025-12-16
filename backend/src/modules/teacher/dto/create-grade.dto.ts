import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, Min, Max } from 'class-validator';

export class CreateGradeDto {
  @ApiProperty({
    description: 'The ID of the student',
    example: 'student-id-123',
  })
  @IsString()
  studentId: string;

  @ApiProperty({
    description: 'The ID of the course',
    example: 'course-id-456',
  })
  @IsString()
  courseId: string;

  @ApiProperty({
    description: 'The grade value (0.0 - 5.0)',
    example: 4.5,
    minimum: 0,
    maximum: 5,
  })
  @IsNumber()
  @Min(0)
  @Max(5)
  grade: number;
}
