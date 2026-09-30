import { Controller, Get } from '@nestjs/common';
import { SyncService } from './sync.service';

@Controller('sync')
export class SyncController {
  constructor(private readonly syncService: SyncService) {}

  @Get('bootstrap')
  async getBootstrap() {
    return this.syncService.getBootstrapData();
  }
}
