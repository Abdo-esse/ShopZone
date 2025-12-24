import { Module } from '@nestjs/common';
import { StoreServiceController } from './store-service.controller';
import { StoreServiceService } from './store-service.service';

@Module({
  imports: [],
  controllers: [StoreServiceController],
  providers: [StoreServiceService],
})
export class StoreServiceModule {}
