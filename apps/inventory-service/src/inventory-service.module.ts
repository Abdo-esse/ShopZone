import { Module } from '@nestjs/common';
import { InventoryServiceController } from './inventory-service.controller';
import { InventoryServiceService } from './inventory-service.service';
import { HealthModule } from './health/health.module';
import { PrismaModule } from 'libs/shared/src/prisma/prisma.module';
import { StockService } from './stock.service';
import { InventoryConsumer } from './inventory.consumer';

@Module({
  imports: [HealthModule, PrismaModule],
  controllers: [InventoryServiceController, InventoryConsumer],
  providers: [InventoryServiceService, StockService],
})
export class InventoryServiceModule { }
