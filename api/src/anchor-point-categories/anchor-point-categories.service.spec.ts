import { Test, TestingModule } from '@nestjs/testing';
import { AnchorPointCategoriesService } from './anchor-point-categories.service';

describe('AnchorPointCategoriesService', () => {
  let service: AnchorPointCategoriesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AnchorPointCategoriesService],
    }).compile();

    service = module.get<AnchorPointCategoriesService>(AnchorPointCategoriesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
