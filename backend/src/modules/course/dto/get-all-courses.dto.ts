
import { IsString, IsNotEmpty } from 'class-validator';

export class GetAllCoursesDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  teacherId: string;
}
