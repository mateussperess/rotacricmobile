import { Test, TestingModule } from '@nestjs/testing';
import { AnchorPointsService } from './anchor-points.service';

describe('AnchorPointsService', () => {
  let service: AnchorPointsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AnchorPointsService],
    }).compile();

    service = module.get<AnchorPointsService>(AnchorPointsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
