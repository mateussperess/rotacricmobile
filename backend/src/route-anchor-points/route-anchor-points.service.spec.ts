import { Test, TestingModule } from '@nestjs/testing';
import { RouteAnchorPointsService } from './route-anchor-points.service';

describe('RouteAnchorPointsService', () => {
  let service: RouteAnchorPointsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RouteAnchorPointsService],
    }).compile();

    service = module.get<RouteAnchorPointsService>(RouteAnchorPointsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
