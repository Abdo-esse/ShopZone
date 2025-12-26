import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller()
export class HealthController {
  @MessagePattern('health.order')
  handleHealth(@Payload() data: { service: string }) {
    if (data.service !== 'order-service') return;

    return {
      service: 'order-service',
      status: 'UP',
      timestamp: new Date().toISOString(),
    };
  }
}
