import { ApiProperty } from '@nestjs/swagger';

export class UpdateAvatarDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description:
      'Avatar image file (JPEG, PNG, WebP). Will be compressed to 500x500px and converted to WebP',
  })
  avatar: Express.Multer.File;
}
