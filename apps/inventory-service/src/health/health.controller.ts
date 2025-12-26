import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller()
export class HealthController {
  @MessagePattern('health.inventory')
  handleHealth(@Payload() data: { service: string }) {
    if (data.service !== 'inventory-service') return;

    return {
      service: 'inventory-service',
      status: 'UP',
      timestamp: new Date().toISOString(),
    };
  }
}
