import { Test, TestingModule } from '@nestjs/testing';
import { RouteAnchorPointsController } from './route-anchor-points.controller';
import { RouteAnchorPointsService } from './route-anchor-points.service';

describe('RouteAnchorPointsController', () => {
  let controller: RouteAnchorPointsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RouteAnchorPointsController],
      providers: [RouteAnchorPointsService],
    }).compile();

    controller = module.get<RouteAnchorPointsController>(RouteAnchorPointsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
