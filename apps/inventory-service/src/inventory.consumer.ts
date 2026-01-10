import { Controller } from '@nestjs/common';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import { StockService } from './stock.service';
import { UpdateFullInventoryDto } from 'libs/shared/src/dto/update-full-inventory.dto';

@Controller()
export class InventoryConsumer {
    constructor(private readonly stockService: StockService) { }

    @EventPattern('product.created')
    async handleProductCreated(@Payload() data: { productId: string }) {
        console.log(`[Inventory] Creating inventory for product: ${data.productId}`);
        await this.stockService.createInventory(data.productId);
    }

    @MessagePattern('inventory.stock.get')
    async getStock(@Payload() data: { productId: string }) {
        return this.stockService.getAvailableStock(data.productId);
    }

    @MessagePattern('inventory.stock.check')
    async handleStockCheck(@Payload() data: { productId: string }) {
        const available = await this.stockService.getAvailableStock(data.productId).catch(() => 0);
        return { available };
    }

    @MessagePattern('inventory.stock.in-stock')
    async isInStock(@Payload() data: { productId: string }) {
        return this.stockService.isInStock(data.productId);
    }

    @MessagePattern('inventory.stock.adjust')
    async adjustStock(@Payload() data: { productId: string; delta: number; reason?: string }) {
        return this.stockService.adjustStock(data.productId, data.delta, data.reason);
    }

    @MessagePattern('inventory.stock.reserve')
    async reserveStock(@Payload() data: { productId: string; quantity: number }) {
        return this.stockService.reserveStock(data.productId, data.quantity);
    }

    @MessagePattern('inventory.stock.confirm')
    async confirmStock(@Payload() data: { productId: string; quantity: number }) {
        return this.stockService.confirmReservedStock(data.productId, data.quantity);
    }

    @MessagePattern('inventory.stock.release')
    async releaseStock(@Payload() data: { productId: string; quantity: number }) {
        return this.stockService.releaseReservedStock(data.productId, data.quantity);
    }

    @MessagePattern('inventory.update')
    async updateInventory(@Payload() data: { productId: string } & UpdateFullInventoryDto) {
        const { productId, ...updateData } = data;
        console.log(`[Inventory] Full update for product ${productId}`, updateData);
        return this.stockService.updateDetails(productId, updateData);
    }
}
