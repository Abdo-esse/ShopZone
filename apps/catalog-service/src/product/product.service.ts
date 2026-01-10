import { ConflictException, Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from 'libs/shared/src/prisma/prisma.service';
import { CreateProductDto } from '../../../../libs/shared/src/dto/create-product.dto';
import { UpdateProductDto } from '../../../../libs/shared/src/dto/update-product.dto';
import { ClientKafka } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class ProductService implements OnModuleInit {
    constructor(
        private prisma: PrismaService,
        @Inject('INVENTORY_SERVICE') private readonly inventoryClient: ClientKafka,
    ) { }

    async onModuleInit() {
        this.inventoryClient.subscribeToResponseOf('inventory.stock.check');
        await this.inventoryClient.connect();
    }

    async create(createProductDto: CreateProductDto) {
        const existing = await this.prisma.product.findUnique({
            where: { sku: createProductDto.sku },
        })

        if (existing) {
            throw new ConflictException(`SKU '${createProductDto.sku}' already exists`)
        }

        const product = await this.prisma.product.create({
            data: createProductDto,
        });

        // Emit event to inventory service
        this.inventoryClient.emit('product.created', {
            productId: product.id,
            sku: product.sku,
            name: product.name,
        });

        return product;
    }

    async findAll() {
        return this.prisma.product.findMany({
            where: { isDeleted: false },
            include: { category: true },
        });
    }

    async findOne(id: string) {
        return this.prisma.product.findUnique({
            where: { id, isDeleted: false },
            include: { category: true },
        });
    }

    async update(id: string, updateProductDto: UpdateProductDto) {
        return this.prisma.product.update({
            where: { id },
            data: updateProductDto,
        });
    }

    async remove(id: string) {
        try {
            const stockInfo = await firstValueFrom(
                this.inventoryClient.send('inventory.stock.check', { productId: id })
            ).catch(() => null);

            if (stockInfo === null) {
                // Inventory service is DOWN
                return this.prisma.product.update({
                    where: { id },
                    data: { status: 'PENDING_DELETE' as any },
                });
            }

            if (stockInfo.available > 0) {
                throw new ConflictException(`Cannot delete product ${id}: stock is not 0 (${stockInfo.available} available)`);
            }

            return this.prisma.product.update({
                where: { id },
                data: { isDeleted: true },
            });
        } catch (error) {
            if (error instanceof ConflictException) throw error;

            // Fallback for connectivity issues if not already handled by null check
            return this.prisma.product.update({
                where: { id },
                data: { status: 'PENDING_DELETE' as any },
            });
        }
    }
}
