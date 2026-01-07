import { Controller, Get, Post, Body, Param, Patch } from '@nestjs/common';
import { StockService } from './stock.service';

@Controller('stock')
export class StockController {
    constructor(private readonly stockService: StockService) { }

    @Get(':productId')
    async getStock(@Param('productId') productId: string) {
        return this.stockService.getAvailableStock(productId);
    }

    @Get(':productId/in-stock')
    async isInStock(@Param('productId') productId: string) {
        return this.stockService.isInStock(productId);
    }

    @Patch(':productId/adjust')
    async adjustStock(
        @Param('productId') productId: string,
        @Body() data: { delta: number; reason?: string }
    ) {
        return this.stockService.adjustStock(productId, data.delta, data.reason);
    }

    @Post(':productId/reserve')
    async reserveStock(
        @Param('productId') productId: string,
        @Body() data: { quantity: number }
    ) {
        return this.stockService.reserveStock(productId, data.quantity);
    }

    @Post(':productId/confirm')
    async confirmStock(
        @Param('productId') productId: string,
        @Body() data: { quantity: number }
    ) {
        return this.stockService.confirmReservedStock(productId, data.quantity);
    }

    @Post(':productId/release')
    async releaseStock(
        @Param('productId') productId: string,
        @Body() data: { quantity: number }
    ) {
        return this.stockService.releaseReservedStock(productId, data.quantity);
    }
}
