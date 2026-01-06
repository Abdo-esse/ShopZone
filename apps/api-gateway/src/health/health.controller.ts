// apps/api-gateway/src/health/health.controller.ts
import { Controller, Get } from '@nestjs/common';
import { HealthService } from './health.service';

@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) { }

  @Get()
  async check(): Promise<{ status: string; services: any[] }> {
    console.log('Health check requested');
    return this.healthService.checkAll();
  }

  @Get('db')
  async checkDb(): Promise<{ status: string; databases: any[] }> {
    console.log('Database health check requested');
    return this.healthService.checkAllDatabases();
  }
}
