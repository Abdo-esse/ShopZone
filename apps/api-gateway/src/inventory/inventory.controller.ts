import { Controller, Get, Post, Body, Param, Patch, UseGuards } from '@nestjs/common';
import { KafkaClientService } from '../kafka/kafka-client.service';
import { firstValueFrom } from 'rxjs';
import { UpdateFullInventoryDto } from 'libs/shared/src/dto/update-full-inventory.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from 'libs/shared/src/enum/user-role.enum';

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
    @Patch(':productId')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    async updateInventory(
        @Param('productId') productId: string,
        @Body() data: UpdateFullInventoryDto
    ) {
        return firstValueFrom(
            this.kafkaClient.getClient().send('inventory.update', { productId, ...data }),
        );
    }
}
