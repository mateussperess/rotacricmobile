import { Test, TestingModule } from '@nestjs/testing';
import { RouteSegmentsService } from './route-segments.service';

describe('RouteSegmentsService', () => {
  let service: RouteSegmentsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RouteSegmentsService],
    }).compile();

    service = module.get<RouteSegmentsService>(RouteSegmentsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
