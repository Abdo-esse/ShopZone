import { Module } from '@nestjs/common';
import { StoreServiceController } from './store-service.controller';
import { StoreServiceService } from './store-service.service';
import { HealthModule } from './health/health.module';

@Module({
  imports: [HealthModule],
  controllers: [StoreServiceController],
  providers: [StoreServiceService],
})
export class StoreServiceModule { }
