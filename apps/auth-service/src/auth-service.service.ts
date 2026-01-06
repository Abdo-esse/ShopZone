// apps/auth-service/src/auth-service.service.ts
import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from 'libs/shared/src/prisma/prisma.service';

@Injectable()
export class AuthServiceService implements OnModuleInit {
  constructor(private readonly prisma: PrismaService) {}

  
  async onModuleInit() {
    const users = await this.prisma.user.findMany();
    console.log('Users in DB:', users.length);
  }
}
