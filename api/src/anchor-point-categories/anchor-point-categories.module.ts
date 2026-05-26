import { Module } from '@nestjs/common';
import { AnchorPointCategoriesService } from './anchor-point-categories.service';
import { AnchorPointCategoriesController } from './anchor-point-categories.controller';

@Module({
  controllers: [AnchorPointCategoriesController],
  providers: [AnchorPointCategoriesService],
})
export class AnchorPointCategoriesModule {}
