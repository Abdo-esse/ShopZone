// apps/auth-service/src/health/health.controller.ts
import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller()
export class HealthController {
  @MessagePattern('health.auth')
  handleHealth(@Payload() data: { service: string }) {
    // Only respond if the request is for this service
    if (data.service === 'auth-service') {
      return {
        service: 'auth-service',
        status: 'UP',
        timestamp: new Date().toISOString(),
      };
    }

    // Return null for other services (won't be sent back)
    return null;
  }
}
