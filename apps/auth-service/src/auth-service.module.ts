// apps/auth-service/src/auth-service.module.ts
import { Module } from '@nestjs/common';
import { AuthServiceController } from './auth-service.controller';
import { AuthServiceService } from './auth-service.service';
import { HealthModule } from './health/health.module';
import { PrismaModule } from 'libs/shared/src/prisma/prisma.module';
import { JwtModule } from '@nestjs/jwt';
@Module({
  imports: [
    HealthModule,
    PrismaModule,
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET || 'secretKey',
      signOptions: { expiresIn: '1d' },
    }),
  ],
  controllers: [AuthServiceController],
  providers: [AuthServiceService],
})
export class AuthServiceModule { }
