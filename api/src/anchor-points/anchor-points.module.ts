import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AnchorPointsController } from './anchor-points.controller';
import { AnchorPointsService } from './anchor-points.service';

@Module({
  imports: [PrismaModule],
  controllers: [AnchorPointsController],
  providers: [AnchorPointsService],
})
export class AnchorPointsModule {}
