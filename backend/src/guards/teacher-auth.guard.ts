import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class TeacherAuthGuard extends AuthGuard('jwt') {
  // JWT Guard is applied first, then we can add teacher-specific logic if needed
  // The @UseGuards decorator will handle the JWT validation
}
