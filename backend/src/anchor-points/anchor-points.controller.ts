import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AdminGuard } from 'src/auth/admin.guard';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { AnchorPointsService } from './anchor-points.service';
import { AnchorPointResponseDto } from './dto/anchor-point-response.dto';
import { CreateAnchorPointDto } from './dto/create-anchor-point.dto';
import { UpdateAnchorPointDto } from './dto/update-anchor-point.dto';

@Controller('anchor-points')
export class AnchorPointsController {
  constructor(private readonly anchorPointsService: AnchorPointsService) {}

  @Get()
  findAll() {
    return this.anchorPointsService.findAll();
  }

  @Get('city/:city_id')
  findAllByCity(@Param('city_id') city_id: string) {
    return this.anchorPointsService.findAllByCity(city_id);
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Get('admin/all')
  findAllAdmin() {
    return this.anchorPointsService.findAllAdmin();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.anchorPointsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Post()
  create(@Body() createAnchorPointDto: CreateAnchorPointDto) {
    return this.anchorPointsService.create(createAnchorPointDto);
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Patch(':id/toggle-active')
  toggleActive(@Param('id') id: string) {
    return this.anchorPointsService.toggleActive(id);
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.anchorPointsService.remove(id);
  }
}
