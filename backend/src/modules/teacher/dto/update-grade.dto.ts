import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, Min, Max } from 'class-validator';

export class UpdateGradeDto {
  @ApiPropertyOptional({
    description: 'Update the grade value (0.0 - 5.0)',
    example: 4.8,
    minimum: 0,
    maximum: 5,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(5)
  grade?: number;
}
