import { Module } from '@nestjs/common';
import { CatalogServiceController } from './catalog-service.controller';
import { CatalogServiceService } from './catalog-service.service';
import { HealthModule } from './health/health.module';
import { PrismaModule } from 'libs/shared/src/prisma/prisma.module';
import { CategoryModule } from './category/category.module';
import { ProductModule } from './product/product.module';

@Module({
  imports: [HealthModule, PrismaModule, CategoryModule, ProductModule],
  controllers: [CatalogServiceController],
  providers: [CatalogServiceService],
})
export class CatalogServiceModule { }
