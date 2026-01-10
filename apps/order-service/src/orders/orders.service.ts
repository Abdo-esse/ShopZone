import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { PrismaService } from 'libs/shared/src/prisma/prisma.service';
import { CreateOrderDto } from 'libs/shared/src/dto/create-order.dto';
import { OrderStatus } from 'libs/shared/src/enum/order-status.enum';

@Injectable()
export class OrdersService {
    constructor(
        private readonly prisma: PrismaService,
        @Inject('KAFKA_SERVICE') private readonly kafkaClient: ClientKafka,
    ) { }

    async onModuleInit() {
        this.kafkaClient.subscribeToResponseOf('inventory.stock.reserve'); // If we were doing req-resp, but we are event driven
        await this.kafkaClient.connect();
    }

    async createOrder(createOrderDto: CreateOrderDto, userId: string) {
        const totalAmount = createOrderDto.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        const order = await this.prisma.order.create({
            data: {
                userId,
                status: OrderStatus.PENDING,
                totalAmount,
                shippingAddress: createOrderDto.shippingAddress,
                items: {
                    create: createOrderDto.items.map(item => ({
                        productId: item.productId,
                        quantity: item.quantity,
                        price: item.price
                    }))
                }
            },
            include: { items: true },
        });

        // Emit order.created event
        this.kafkaClient.emit('order.created', {
            orderId: order.id,
            userId,
            items: order.items,
        });

        return order;
    }

    async getOrdersByUser(userId: string) {
        return this.prisma.order.findMany({
            where: { userId },
            include: { items: true },
            orderBy: { createdAt: 'desc' }
        });
    }

    async getOrderById(orderId: string) {
        const order = await this.prisma.order.findUnique({
            where: { id: orderId },
            include: { items: true }
        });
        if (!order) throw new NotFoundException(`Order ${orderId} not found`);
        return order;
    }

    // --- Saga / Event Handlers ---

    async confirmOrder(orderId: string) {
        const order = await this.getOrderById(orderId);
        if (order.status !== OrderStatus.PENDING) return; // Idempotency check

        const updated = await this.prisma.order.update({
            where: { id: orderId },
            data: { status: OrderStatus.CONFIRMED }
        });

        this.kafkaClient.emit('order.confirmed', { orderId });
        return updated;
    }

    async cancelOrder(orderId: string, reason: string) {
        const order = await this.getOrderById(orderId);
        if (order.status === OrderStatus.CANCELLED || order.status === OrderStatus.DELIVERED) {
            throw new BadRequestException(`Cannot cancel order in status ${order.status}`);
        }

        const updated = await this.prisma.order.update({
            where: { id: orderId },
            data: { status: OrderStatus.CANCELLED, notes: reason }
        });

        this.kafkaClient.emit('order.cancelled', { orderId, reason });
        // Inventory service should listen to order.cancelled to release stock
        return updated;
    }

    async markShipped(orderId: string) {
        const order = await this.getOrderById(orderId);
        if (order.status !== OrderStatus.CONFIRMED && order.status !== OrderStatus.PROCESSING) {
            throw new BadRequestException('Order must be CONFIRMED or PROCESSING to be shipped');
        }

        const updated = await this.prisma.order.update({
            where: { id: orderId },
            data: { status: OrderStatus.SHIPPED }
        });

        this.kafkaClient.emit('order.shipped', { orderId });
        return updated;
    }

    async markDelivered(orderId: string) {
        const order = await this.getOrderById(orderId);
        if (order.status !== OrderStatus.SHIPPED) {
            throw new BadRequestException('Order must be SHIPPED to be delivered');
        }

        const updated = await this.prisma.order.update({
            where: { id: orderId },
            data: { status: OrderStatus.DELIVERED }
        });

        this.kafkaClient.emit('order.delivered', { orderId });
        return updated;
    }
}
