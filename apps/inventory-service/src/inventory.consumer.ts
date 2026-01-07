import { Controller } from '@nestjs/common';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import { StockService } from './stock.service';

@Controller()
export class InventoryConsumer {
    constructor(private readonly stockService: StockService) { }

    @EventPattern('product.created')
    async handleProductCreated(@Payload() data: { productId: string }) {
        console.log(`[Inventory] Creating inventory for product: ${data.productId}`);
        await this.stockService.createInventory(data.productId);
    }

    @MessagePattern('inventory.stock.check')
    async handleStockCheck(@Payload() data: { productId: string }) {
        const available = await this.stockService.getAvailableStock(data.productId).catch(() => 0);
        return { available };
    }
}
