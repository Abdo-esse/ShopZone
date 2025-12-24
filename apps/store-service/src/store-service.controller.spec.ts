import { Test, TestingModule } from '@nestjs/testing';
import { StoreServiceController } from './store-service.controller';
import { StoreServiceService } from './store-service.service';

describe('StoreServiceController', () => {
  let storeServiceController: StoreServiceController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [StoreServiceController],
      providers: [StoreServiceService],
    }).compile();

    storeServiceController = app.get<StoreServiceController>(StoreServiceController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(storeServiceController.getHello()).toBe('Hello World!');
    });
  });
});
