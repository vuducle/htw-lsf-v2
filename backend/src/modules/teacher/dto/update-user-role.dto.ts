import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsBoolean } from 'class-validator';

export class UpdateUserRoleDto {
  @ApiProperty({
    example: 'clz123xyz',
    description: 'User ID to grant or revoke teacher role',
  })
  @IsString()
  userId: string;

  @ApiProperty({
    example: true,
    description: 'true to grant teacher role, false to revoke',
  })
  @IsBoolean()
  isTeacher: boolean;
}
