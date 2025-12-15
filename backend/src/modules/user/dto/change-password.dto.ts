import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({
    example: 'OldPassword123!',
    description: 'Current password',
  })
  @IsString()
  @MinLength(8, { message: 'Current password must be at least 8 characters' })
  currentPassword: string;

  @ApiProperty({
    example: 'NewPassword456!',
    description: 'New password (must be different from current)',
  })
  @IsString()
  @MinLength(8, { message: 'New password must be at least 8 characters' })
  newPassword: string;

  @ApiProperty({
    example: 'NewPassword456!',
    description: 'Confirm new password',
  })
  @IsString()
  newPasswordConfirm: string;
}
