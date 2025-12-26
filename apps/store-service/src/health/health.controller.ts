import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller()
export class HealthController {
  @MessagePattern('health.store')
  handleHealth(@Payload() data: { service: string }) {
    if (data.service !== 'store-service') return;

    return {
      service: 'store-service',
      status: 'UP',
      timestamp: new Date().toISOString(),
    };
  }
}
