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

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @Body() createRouteAnchorPointDto: CreateRouteAnchorPointDto,
  ): Promise<RouteAnchorPointResponseDto> {
    return this.routeAnchorPointsService.create(createRouteAnchorPointDto);
  }

  @Get()
  findAll() {
    return this.routeAnchorPointsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.routeAnchorPointsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateRouteAnchorPointDto: UpdateRouteAnchorPointDto,
  ) {
    return this.routeAnchorPointsService.update(id, updateRouteAnchorPointDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.routeAnchorPointsService.remove(id);
  }
}
