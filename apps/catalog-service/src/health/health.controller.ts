import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller()
export class HealthController {
  @MessagePattern('health.catalog')
  handleHealth(@Payload() data: { service: string }) {
    if (data.service !== 'catalog-service') return;

    return {
      service: 'catalog-service',
      status: 'UP',
      timestamp: new Date().toISOString(),
    };
  }
}
