import { Module } from '@nestjs/common';
import { RouteAnchorPointsService } from './route-anchor-points.service';
import { RouteAnchorPointsController } from './route-anchor-points.controller';

@Module({
  controllers: [RouteAnchorPointsController],
  providers: [RouteAnchorPointsService],
})
export class RouteAnchorPointsModule {}
