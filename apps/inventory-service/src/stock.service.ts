import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from 'libs/shared/src/prisma/prisma.service';

@Injectable()
export class StockService {
    constructor(private prisma: PrismaService) { }

    async createInventory(productId: string) {
        return this.prisma.inventory.upsert({
            where: { productId },
            update: {},
            create: { productId, quantity: 0, reserved: 0 },
        });
    }

    async getInventory(productId: string) {
        const inventory = await this.prisma.inventory.findUnique({
            where: { productId },
        });
        if (!inventory) throw new NotFoundException(`Inventory for product ${productId} not found`);
        return inventory;
    }

    async isInStock(productId: string, quantity: number = 1) {
        const inventory = await this.getInventory(productId);
        return (inventory.quantity - inventory.reserved) >= quantity;
    }

    async getAvailableStock(productId: string) {
        const inventory = await this.getInventory(productId);
        return inventory.quantity - inventory.reserved;
    }

    async reserveStock(productId: string, quantity: number) {
        const inventory = await this.getInventory(productId);
        if ((inventory.quantity - inventory.reserved) < quantity) {
            throw new BadRequestException('Insufficient stock available for reservation');
        }

        return this.prisma.$transaction(async (tx) => {
            const updated = await tx.inventory.update({
                where: { productId },
                data: { reserved: { increment: quantity } },
            });

            await tx.stockMovement.create({
                data: {
                    productId,
                    quantity,
                    type: 'RESERVE',
                    reason: 'Stock reservation',
                },
            });

            return updated;
        });
    }

    async releaseReservedStock(productId: string, quantity: number) {
        const inventory = await this.getInventory(productId);
        if (inventory.reserved < quantity) {
            throw new BadRequestException('Cannot release more than reserved quantity');
        }

        return this.prisma.$transaction(async (tx) => {
            const updated = await tx.inventory.update({
                where: { productId },
                data: { reserved: { decrement: quantity } },
            });

            await tx.stockMovement.create({
                data: {
                    productId,
                    quantity: -quantity,
                    type: 'RELEASE',
                    reason: 'Reservation release',
                },
            });

            return updated;
        });
    }

    async confirmReservedStock(productId: string, quantity: number) {
        const inventory = await this.getInventory(productId);
        if (inventory.reserved < quantity) {
            throw new BadRequestException('Cannot confirm more than reserved quantity');
        }

        return this.prisma.$transaction(async (tx) => {
            const updated = await tx.inventory.update({
                where: { productId },
                data: {
                    quantity: { decrement: quantity },
                    reserved: { decrement: quantity },
                },
            });

            await tx.stockMovement.create({
                data: {
                    productId,
                    quantity: -quantity,
                    type: 'OUT',
                    reason: 'Order confirmed',
                },
            });

            return updated;
        });
    }

    async adjustStock(productId: string, delta: number, reason?: string) {
        const inventory = await this.getInventory(productId);
        if (inventory.quantity + delta < 0) {
            throw new BadRequestException('Adjustment would result in negative stock');
        }

        return this.prisma.$transaction(async (tx) => {
            const updated = await tx.inventory.update({
                where: { productId },
                data: { quantity: { increment: delta } },
            });

            await tx.stockMovement.create({
                data: {
                    productId,
                    quantity: delta,
                    type: delta > 0 ? 'IN' : 'ADJUSTMENT',
                    reason: reason || 'Manual adjustment',
                },
            });

            return updated;
        });
    }

    async decreaseStock(productId: string, quantity: number, reason?: string) {
        return this.adjustStock(productId, -quantity, reason || 'Stock decrease');
    }
    async updateDetails(productId: string, data: Partial<{ location: string; minStock: number; maxStock: number; quantity: number; reserved: number }>) {
        const inventory = await this.getInventory(productId);

        // Log movement if quantity changes absolutely
        if (typeof data.quantity === 'number' && data.quantity !== inventory.quantity) {
            const delta = data.quantity - inventory.quantity;
            await this.prisma.stockMovement.create({
                data: {
                    productId,
                    quantity: delta,
                    type: 'ADJUSTMENT',
                    reason: 'Full update override',
                }
            });
        }

        return this.prisma.inventory.update({
            where: { productId },
            data: {
                ...data,
            }
        });
    }
}
