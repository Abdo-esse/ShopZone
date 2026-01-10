import { NestFactory } from '@nestjs/core';
import { CatalogServiceModule } from './catalog-service.module';
import { Transport } from '@nestjs/microservices';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(CatalogServiceModule);

  app.connectMicroservice({
    transport: Transport.KAFKA,
    options: {
      client: {
        clientId: 'catalog-service',
        brokers: [process.env.KAFKA_BROKER ?? 'kafka:9092'],
      },
      consumer: {
        groupId: 'catalog-service-consumer',
      },
    },
  });

   app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    )

  await app.startAllMicroservices();
  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();

