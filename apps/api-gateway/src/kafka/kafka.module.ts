// apps/api-gateway/src/kafka/kafka.module.ts
import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { KafkaClientService } from './kafka-client.service';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'KAFKA_CLIENT',
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: 'api-gateway',
            brokers: [process.env.KAFKA_BROKER ?? 'kafka:9092'],
          },
          consumer: {
            groupId: 'api-gateway-consumer',
          },
          producer: {
            allowAutoTopicCreation: true,
          },
          producerOnlyMode: false, // Required for request-reply pattern
        },
      },
    ]),
  ],
  providers: [KafkaClientService],
  exports: [ClientsModule, KafkaClientService],
})
export class KafkaModule { }

