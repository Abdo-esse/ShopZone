import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { PrismaService } from 'libs/shared/src/prisma/prisma.service';

@Controller()
export class HealthController {
  constructor(private readonly prisma: PrismaService) { }

  @MessagePattern('health.order')
  handleHealth(@Payload() data: { service: string }) {
    if (data.service !== 'order-service') return;

    return {
      service: 'order-service',
      status: 'UP',
      timestamp: new Date().toISOString(),
    };
  }

  @MessagePattern('health-db.order')
  async handleHealthDb() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return {
        service: 'order-service',
        database: 'UP',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        service: 'order-service',
        database: 'DOWN',
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString(),
      };
    }
  }
}
