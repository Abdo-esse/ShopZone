import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { PrismaService } from 'libs/shared/src/prisma/prisma.service';

@Controller()
export class HealthController {
  constructor(private readonly prisma: PrismaService) { }

  @MessagePattern('health.inventory')
  handleHealth(@Payload() data: { service: string }) {
    if (data.service !== 'inventory-service') return;

    return {
      service: 'inventory-service',
      status: 'UP',
      timestamp: new Date().toISOString(),
    };
  }

  @MessagePattern('health-db.inventory')
  async handleHealthDb() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return {
        service: 'inventory-service',
        database: 'UP',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        service: 'inventory-service',
        database: 'DOWN',
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString(),
      };
    }
  }
}
