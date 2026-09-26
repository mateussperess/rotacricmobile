import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AdminGuard } from 'src/auth/admin.guard';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CreateStampDto } from './dto/create-stamp.dto';
import { SyncStampsDto } from './dto/sync-stamps.dto';
import { StampsService } from './stamps.service';

@Controller('stamps')
export class StampsController {
  constructor(private readonly stampsService: StampsService) {}

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Post()
  async createStamp(@Body() dto: CreateStampDto) {
    return this.stampsService.createStamp(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAllStamps() {
    return this.stampsService.findAllStamps();
  }

  @UseGuards(JwtAuthGuard)
  @Get('my-stamps')
  async getUserStamps(@Req() req: any) {
    const userId = parseInt(req.user.userId, 10);
    return this.stampsService.getUserStamps(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('anchor-point/:id')
  async findByAnchorPoint(@Param('id', ParseIntPipe) id: number) {
    return this.stampsService.findStampByAnchorPoint(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('sync')
  async syncOfflineStamps(@Req() req: any, @Body() dto: SyncStampsDto) {
    const userId = parseInt(req.user.userId, 10);
    return this.stampsService.syncOfflineStamps(userId, dto);
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Patch(':id/toggle-active')
  async toggleActive(@Param('id', ParseIntPipe) id: number) {
    return this.stampsService.toggleActive(id);
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Delete(':id')
  async deleteStamp(@Param('id', ParseIntPipe) id: number) {
    return this.stampsService.deleteStamp(id);
  }
}
