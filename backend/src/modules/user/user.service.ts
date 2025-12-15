import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class UserService {
  // Use this.prisma.client to access the Prisma Client
  constructor(private prisma: PrismaService) {}
}
