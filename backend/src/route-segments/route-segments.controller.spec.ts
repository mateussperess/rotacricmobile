import { Test, TestingModule } from '@nestjs/testing';
import { RouteSegmentsController } from './route-segments.controller';
import { RouteSegmentsService } from './route-segments.service';

describe('RouteSegmentsController', () => {
  let controller: RouteSegmentsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RouteSegmentsController],
      providers: [RouteSegmentsService],
    }).compile();

    controller = module.get<RouteSegmentsController>(RouteSegmentsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
