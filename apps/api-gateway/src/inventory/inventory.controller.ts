import { Controller, Get, Post, Body, Param, Patch } from '@nestjs/common';
import { KafkaClientService } from '../kafka/kafka-client.service';
import { firstValueFrom } from 'rxjs';

@Controller('inventory/stock')
export class InventoryController {
    constructor(private readonly kafkaClient: KafkaClientService) { }

    @Get(':productId')
    async getStock(@Param('productId') productId: string) {
        return firstValueFrom(
            this.kafkaClient.getClient().send('inventory.stock.get', { productId }),
        );
    }

    @Get(':productId/in-stock')
    async isInStock(@Param('productId') productId: string) {
        return firstValueFrom(
            this.kafkaClient.getClient().send('inventory.stock.in-stock', { productId }),
        );
    }

    @Patch(':productId/adjust')
    async adjustStock(
        @Param('productId') productId: string,
        @Body() data: { delta: number; reason?: string }
    ) {
        return firstValueFrom(
            this.kafkaClient.getClient().send('inventory.stock.adjust', { productId, ...data }),
        );
    }

    @Post(':productId/reserve')
    async reserveStock(
        @Param('productId') productId: string,
        @Body() data: { quantity: number }
    ) {
        return firstValueFrom(
            this.kafkaClient.getClient().send('inventory.stock.reserve', { productId, ...data }),
        );
    }

    @Post(':productId/confirm')
    async confirmStock(
        @Param('productId') productId: string,
        @Body() data: { quantity: number }
    ) {
        return firstValueFrom(
            this.kafkaClient.getClient().send('inventory.stock.confirm', { productId, ...data }),
        );
    }

    @Post(':productId/release')
    async releaseStock(
        @Param('productId') productId: string,
        @Body() data: { quantity: number }
    ) {
        return firstValueFrom(
            this.kafkaClient.getClient().send('inventory.stock.release', { productId, ...data }),
        );
    }
}
