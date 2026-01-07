import { Module } from '@nestjs/common';
import { CatalogController } from './catalog.controller';
import { KafkaModule } from '../kafka/kafka.module';

@Module({
    imports: [KafkaModule],
    controllers: [CatalogController],
})
export class CatalogModule { }
