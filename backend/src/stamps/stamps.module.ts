import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { StampsController } from './stamps.controller';
import { StampsService } from './stamps.service';

@Module({
  imports: [PrismaModule],
  controllers: [StampsController],
  providers: [StampsService],
  exports: [StampsService],
})
export class StampsModule {}
