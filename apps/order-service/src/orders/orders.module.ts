import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { PrismaModule } from 'libs/shared/src/prisma/prisma.module';

@Module({
    imports: [
        PrismaModule,
        ClientsModule.register([
            {
                name: 'KAFKA_SERVICE',
                transport: Transport.KAFKA,
                options: {
                    client: {
                        brokers: ['kafka:9092'],
                    },
                    consumer: {
                        groupId: 'order-service-producer',
                    },
                },
            },
        ]),
    ],
    controllers: [OrdersController],
    providers: [OrdersService],
})
export class OrdersModule { }
