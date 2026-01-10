import { Module } from '@nestjs/common';
import { InventoryController } from './inventory.controller';
import { KafkaModule } from '../kafka/kafka.module';

@Module({
    imports: [KafkaModule],
    controllers: [InventoryController],
})
export class InventoryModule { }
