// apps/api-gateway/src/health/health.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { timeout, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { KafkaClientService } from '../kafka/kafka-client.service';

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);

  // Map services to their specific health topics
  private readonly serviceTopics = {
    'auth-service': 'health.auth',
    'catalog-service': 'health.catalog',
    'inventory-service': 'health.inventory',
    'order-service': 'health.order',
    'store-service': 'health.store',
  };

  // Map services to their database health topics
  private readonly healthDbTopics = {
    'auth-service': 'health-db.auth',
    'catalog-service': 'health-db.catalog',
    'inventory-service': 'health-db.inventory',
    'order-service': 'health-db.order',
  };

  constructor(
    private readonly kafkaClient: KafkaClientService,
  ) { }

  async checkAll() {
    const kafka = this.kafkaClient.getClient();
    const results = await Promise.all(
      Object.entries(this.serviceTopics).map(async ([service, topic]) => {
        try {
          const response = await kafka
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

  async checkAllDatabases() {
    const kafka = this.kafkaClient.getClient();
    const results = await Promise.all(
      Object.entries(this.healthDbTopics).map(async ([service, topic]) => {
        try {
          const response = await kafka
            .send(topic, { service })
            .pipe(
              timeout(5000),
              catchError((error) => {
                this.logger.warn(`Database health check failed for ${service}: ${error.message}`);
                return of({ service, database: 'DOWN', error: error.message });
              }),
            )
            .toPromise();

          return response || { service, database: 'DOWN' };
        } catch (error) {
          this.logger.error(`Error checking database for ${service}:`, error);
          return { service, database: 'DOWN', error: error instanceof Error ? error.message : String(error), };
        }
      }),
    );

    return {
      status: results.every((r) => r.database === 'UP') ? 'UP' : 'DEGRADED',
      databases: results,
    };
  }
}

