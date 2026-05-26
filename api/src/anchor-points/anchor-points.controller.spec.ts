import { Test, TestingModule } from '@nestjs/testing';
import { AnchorPointsController } from './anchor-points.controller';
import { AnchorPointsService } from './anchor-points.service';

describe('AnchorPointsController', () => {
  let controller: AnchorPointsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AnchorPointsController],
      providers: [AnchorPointsService],
    }).compile();

    controller = module.get<AnchorPointsController>(AnchorPointsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
