import { Module } from '@nestjs/common';
import { TeacherService } from './teacher.service';
import { TeacherController } from './teacher.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { TeacherAuthGuard } from '../../guards/teacher-auth.guard';

@Module({
  imports: [PrismaModule],
  controllers: [TeacherController],
  providers: [TeacherService, TeacherAuthGuard],
  exports: [TeacherService],
})
export class TeacherModule {}
