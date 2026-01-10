import { Controller } from '@nestjs/common';
import { MessagePattern, Payload, EventPattern } from '@nestjs/microservices';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from 'libs/shared/src/dto/create-order.dto';

@Controller()
export class OrdersController {
    constructor(private readonly ordersService: OrdersService) { }

    @MessagePattern('order.create')
    create(@Payload() data: { createOrderDto: CreateOrderDto, userId: string }) {
        return this.ordersService.createOrder(data.createOrderDto, data.userId);
    }

    @MessagePattern('order.findAllByUser')
    findAllByUser(@Payload() userId: string) {
        return this.ordersService.getOrdersByUser(userId);
    }

    @MessagePattern('order.findOne')
    findOne(@Payload() id: string) {
        return this.ordersService.getOrderById(id);
    }

    @MessagePattern('order.cancel')
    cancel(@Payload() data: { orderId: string, reason: string }) {
        return this.ordersService.cancelOrder(data.orderId, data.reason);
    }

    // --- Saga Events ---

    @EventPattern('inventory.stock.reserved')
    handleStockReserved(@Payload() data: { orderId: string }) {
        console.log(`[Order] Stock reserved for order ${data.orderId}`);
        this.ordersService.confirmOrder(data.orderId);
    }

    @EventPattern('inventory.stock.failed')
    handleStockFailed(@Payload() data: { orderId: string, reason: string }) {
        console.log(`[Order] Stock failed for order ${data.orderId}: ${data.reason}`);
        this.ordersService.cancelOrder(data.orderId, `Inventory failed: ${data.reason}`);
    }
}
