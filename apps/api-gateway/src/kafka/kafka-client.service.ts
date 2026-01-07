// apps/api-gateway/src/kafka/kafka-client.service.ts
import { Injectable, Inject, OnModuleInit, Logger } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';

@Injectable()
export class KafkaClientService implements OnModuleInit {
    private readonly logger = new Logger(KafkaClientService.name);
    private isConnected = false;

    // All reply topics that need to be subscribed
    private readonly replyTopics = [
        // Auth topics
        'user.registered',
        'user.login',
        'user.refresh',
        'user.logout',
        // Health check topics
        'health.auth',
        'health.catalog',
        'health.inventory',
        'health.order',
        'health.store',
        // Database health topics
        'health-db.auth',
        'health-db.catalog',
        'health-db.inventory',
        'health-db.order',
        // Catalog topics
        'catalog.category.create',
        'catalog.category.findAll',
        'catalog.category.findOne',
        'catalog.category.update',
        'catalog.category.remove',
        'catalog.product.create',
        'catalog.product.findAll',
        'catalog.product.findOne',
        'catalog.product.update',
        'catalog.product.remove',
    ];

    constructor(
        @Inject('KAFKA_CLIENT') private readonly client: ClientKafka,
    ) { }

    async onModuleInit() {
        // Subscribe to ALL reply topics BEFORE connecting
        this.logger.log('Subscribing to reply topics...');
        for (const topic of this.replyTopics) {
            this.client.subscribeToResponseOf(topic);
            this.logger.log(`Subscribed to ${topic}.reply`);
        }

        // Connect only once
        await this.client.connect();
        this.isConnected = true;
        this.logger.log('Kafka client connected successfully');
    }

    getClient(): ClientKafka {
        return this.client;
    }

    isReady(): boolean {
        return this.isConnected;
    }
}
