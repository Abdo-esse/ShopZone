import { Module } from '@nestjs/common';
import { KafkaModule } from '../kafka/kafka.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from '../common/strategies/jwt.strategy';

@Module({
    imports: [KafkaModule, PassportModule],
    controllers: [AuthController],
    providers: [AuthService, JwtStrategy],
})
export class AuthModule {}
