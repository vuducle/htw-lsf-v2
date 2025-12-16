import {
  IsOptional,
  IsString,
  IsNumber,
  Min,
  Max,
  IsISO8601,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class GetAllCoursesQueryDto {
  @ApiPropertyOptional({
    description:
      'Search term for course title, code, or description (fuzzy matching)',
    example: 'web',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filter courses by teacher ID',
    example: 'cmj6vcg5r0001u7rbprye5aev',
  })
  @IsOptional()
  @IsString()
  teacherId?: string;

  @ApiPropertyOptional({
    description: 'Filter courses by course code (exact match)',
    example: 'CS101',
  })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiPropertyOptional({
    description: 'Filter courses starting from this date (ISO 8601 format)',
    example: '2025-01-01',
  })
  @IsOptional()
  @IsISO8601()
  startDateFrom?: string;

  @ApiPropertyOptional({
    description: 'Filter courses ending before this date (ISO 8601 format)',
    example: '2026-12-31',
  })
  @IsOptional()
  @IsISO8601()
  endDateTo?: string;

  @ApiPropertyOptional({
    description: 'Sort by field: title, code, startDate, endDate, createdAt',
    example: 'startDate',
  })
  @IsOptional()
  @IsString()
  sortBy?: 'title' | 'code' | 'startDate' | 'endDate' | 'createdAt' =
    'createdAt';

  @ApiPropertyOptional({
    description: 'Sort order: asc or desc',
    example: 'asc',
  })
  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc' = 'asc';

  @ApiPropertyOptional({
    description: 'Page number for pagination',
    minimum: 1,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Number of items per page',
    minimum: 1,
    maximum: 100,
    default: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 10;
}
