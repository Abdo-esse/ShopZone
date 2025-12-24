import { NestFactory } from '@nestjs/core';
import { StoreServiceModule } from './store-service.module';

async function bootstrap() {
  const app = await NestFactory.create(StoreServiceModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
