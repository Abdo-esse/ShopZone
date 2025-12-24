import { Controller, Get } from '@nestjs/common';
import { StoreServiceService } from './store-service.service';

@Controller()
export class StoreServiceController {
  constructor(private readonly storeServiceService: StoreServiceService) {}

  @Get()
  getHello(): string {
    return this.storeServiceService.getHello();
  }
}
