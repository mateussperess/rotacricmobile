import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { RouteSegmentsController } from './route-segments.controller';
import { RouteSegmentsService } from './route-segments.service';

@Module({
  imports: [PrismaModule],
  controllers: [RouteSegmentsController],
  providers: [RouteSegmentsService],
})
export class RouteSegmentsModule {}
