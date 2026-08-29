import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { CreateRouteAnchorPointDto } from './dto/create-route-anchor-point.dto';
import { RouteAnchorPointResponseDto } from './dto/route-anchor-point-response.dto';
import { UpdateRouteAnchorPointDto } from './dto/update-route-anchor-point.dto';
import { RouteAnchorPointsService } from './route-anchor-points.service';

@Controller('route-anchor-points')
export class RouteAnchorPointsController {
  constructor(
    private readonly routeAnchorPointsService: RouteAnchorPointsService,
  ) {}

  @Get()
  findAll() {
    return this.routeAnchorPointsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.routeAnchorPointsService.findOne(id);
  }
}
