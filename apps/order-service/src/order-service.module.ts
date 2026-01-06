import { Module } from '@nestjs/common';
import { OrderServiceController } from './order-service.controller';
import { OrderServiceService } from './order-service.service';
import { HealthModule } from './health/health.module';
import { PrismaModule } from 'libs/shared/src/prisma/prisma.module';

@Module({
  imports: [HealthModule, PrismaModule],
  controllers: [OrderServiceController],
  providers: [OrderServiceService],
})
export class OrderServiceModule { }
