// apps/api-gateway/src/health/health.service.ts
import { Injectable, Inject, OnModuleInit, Logger } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { timeout, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Injectable()
export class HealthService implements OnModuleInit {
  private readonly logger = new Logger(HealthService.name);

  // Map services to their specific health topics
  private readonly serviceTopics = {
    'auth-service': 'health.auth',
    'catalog-service': 'health.catalog',
    'inventory-service': 'health.inventory',
    'order-service': 'health.order',
    'store-service': 'health.store',
  };

  constructor(
    @Inject('KAFKA_CLIENT')
    private readonly kafka: ClientKafka,
  ) { }

  async onModuleInit() {
    // Subscribe to response topics for all services
    Object.values(this.serviceTopics).forEach((topic) => {
      this.kafka.subscribeToResponseOf(topic);
    });

    // Connect to Kafka
    await this.kafka.connect();
    this.logger.log('Connected to Kafka for health checks');
  }

  async checkAll() {
    const results = await Promise.all(
      Object.entries(this.serviceTopics).map(async ([service, topic]) => {
        try {
          const response = await this.kafka
            .send(topic, { service })
            .pipe(
              timeout(3000),
              catchError((error) => {
                this.logger.warn(`Health check failed for ${service} on topic ${topic}: ${error.message}`);
                return of({ service, status: 'DOWN' });
              }),
            )
            .toPromise();

          return response || { service, status: 'DOWN' };
        } catch (error) {
          this.logger.error(`Error checking ${service}:`, error);
          return { service, status: 'DOWN' };
        }
      }),
    );

    return {
      status: results.every((r) => r.status === 'UP') ? 'UP' : 'DEGRADED',
      services: results,
    };
  }
}
