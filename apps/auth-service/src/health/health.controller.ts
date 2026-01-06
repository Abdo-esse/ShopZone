// apps/auth-service/src/health/health.controller.ts
import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { PrismaService } from 'libs/shared/src/prisma/prisma.service';

@Controller()
export class HealthController {
  constructor(private readonly prisma: PrismaService) { }

  @MessagePattern('health.auth')
  handleHealth(@Payload() data: { service: string }) {
    if (data.service === 'auth-service') {
      return {
        service: 'auth-service',
        status: 'UP',
        timestamp: new Date().toISOString(),
      };
    }
    return null;
  }

  @MessagePattern('health-db.auth')
  async handleHealthDb() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return {
        service: 'auth-service',
        database: 'UP',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        service: 'auth-service',
        database: 'DOWN',
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString(),
      };
    }
  }
}
