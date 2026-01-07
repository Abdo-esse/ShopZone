// apps/api-gateway/src/api-gateway.module.ts
import { Module } from '@nestjs/common';
import { ApiGatewayController } from './api-gateway.controller';
import { ApiGatewayService } from './api-gateway.service';
import { KafkaModule } from './kafka/kafka.module';
import { HealthModule } from './health/health.module';
import { AuthModule } from './auth/auth.module';
import { CatalogModule } from './catalog/catalog.module';

@Module({
  imports: [KafkaModule, HealthModule, AuthModule, CatalogModule],
  controllers: [ApiGatewayController],
  providers: [ApiGatewayService],
})
export class ApiGatewayModule { }
