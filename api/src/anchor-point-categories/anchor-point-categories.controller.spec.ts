import { Test, TestingModule } from '@nestjs/testing';
import { AnchorPointCategoriesController } from './anchor-point-categories.controller';
import { AnchorPointCategoriesService } from './anchor-point-categories.service';

describe('AnchorPointCategoriesController', () => {
  let controller: AnchorPointCategoriesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AnchorPointCategoriesController],
      providers: [AnchorPointCategoriesService],
    }).compile();

    controller = module.get<AnchorPointCategoriesController>(AnchorPointCategoriesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
