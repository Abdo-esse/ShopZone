// apps/api-gateway/src/main.ts
import { NestFactory } from '@nestjs/core';
import { ApiGatewayModule } from './api-gateway.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(ApiGatewayModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // supprime les champs non déclarés dans le DTO
      forbidNonWhitelisted: true, // rejette les requêtes avec champs inconnus
      transform: true, // convertit les payloads en instances de DTO
    }),
  );


  app.enableShutdownHooks();

  await app.listen(3000);
}
bootstrap();
