import { Controller, Post, Body, UseGuards, Req, Get, Param, Patch } from '@nestjs/common';
import { KafkaClientService } from '../kafka/kafka-client.service';
import { firstValueFrom } from 'rxjs';
import { CreateOrderDto } from 'libs/shared/src/dto/create-order.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from 'libs/shared/src/enum/user-role.enum';

@Controller('orders')
export class OrderController {
    constructor(private readonly kafkaClient: KafkaClientService) { }

    @Post()
    @UseGuards(JwtAuthGuard)
    create(@Body() createOrderDto: CreateOrderDto, @Req() req: any) {
        return firstValueFrom(
            this.kafkaClient.getClient().send('order.create', { createOrderDto, userId: req.user.sub }),
        );
    }

    @Get()
    @UseGuards(JwtAuthGuard)
    findAllByUser(@Req() req: any) {
        return firstValueFrom(
            this.kafkaClient.getClient().send('order.findAllByUser', req.user.sub)
        );
    }

    @Get(':id')
    @UseGuards(JwtAuthGuard)
    findOne(@Param('id') id: string) {
        // Logic could include checking if user owns the order, but for simplicity:
        return firstValueFrom(
            this.kafkaClient.getClient().send('order.findOne', id)
        );
    }

    @Post(':id/cancel')
    @UseGuards(JwtAuthGuard)
    cancel(@Param('id') id: string, @Body() body: { reason: string }) {
        return firstValueFrom(
            this.kafkaClient.getClient().send('order.cancel', { orderId: id, reason: body.reason })
        );
    }
}
