import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { PrismaModule } from 'libs/shared/src/prisma/prisma.module';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
    imports: [
        PrismaModule,
        ClientsModule.register([
            {
                name: 'INVENTORY_SERVICE',
                transport: Transport.KAFKA,
                options: {
                    client: {
                        clientId: 'catalog',
                        brokers: [process.env.KAFKA_BROKER ?? 'kafka:9092'],
                    },
                    consumer: {
                        groupId: 'inventory-consumer',
                    },
                },
            },
        ]),
    ],
    controllers: [ProductController],
    providers: [ProductService],
    exports: [ProductService],
})
export class ProductModule { }
