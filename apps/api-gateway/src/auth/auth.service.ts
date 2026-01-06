import { Injectable, Logger } from '@nestjs/common';
import { RegisterDto } from '../../../../libs/shared/src/dto/register.dto';
import { LoginDto } from '../../../../libs/shared/src/dto/login.dto';
import { firstValueFrom } from 'rxjs';
import { KafkaClientService } from '../kafka/kafka-client.service';

@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name);

    constructor(
        private readonly kafkaClient: KafkaClientService,
    ) { }

    async register(dto: RegisterDto) {
        this.logger.log(`Registering user: ${dto.email}`);
        return firstValueFrom(
            this.kafkaClient.getClient().send('user.registered', dto),
        );
    }

    async login(dto: LoginDto) {
        this.logger.log(`Login attempt: ${dto.email}`);
        return firstValueFrom(
            this.kafkaClient.getClient().send('user.login', dto),
        );
    }

    async refresh(refreshToken: string) {
        this.logger.log('Refreshing token');
        return firstValueFrom(
            this.kafkaClient.getClient().send('user.refresh', { refreshToken }),
        );
    }

    async logout(userId: string, refreshToken: string) {
        this.logger.log(`Logout attempt for user: ${userId}`);
        return firstValueFrom(
            this.kafkaClient.getClient().send('user.logout', { userId, refreshToken }),
        );
    }
}

