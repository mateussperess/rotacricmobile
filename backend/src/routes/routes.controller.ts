import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import { CreateRouteDto } from './dto/create-route.dto';
import { RouteResponseDto } from './dto/route-response.dto';
import { RoutesService } from './routes.service';

@Controller('routes')
export class RoutesController {
  constructor(private readonly routesService: RoutesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createRouteDto: CreateRouteDto,
  ): Promise<RouteResponseDto> {
    return this.routesService.create(createRouteDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(): Promise<RouteResponseDto[]> {
    return this.routesService.findAll();
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id') id: string): Promise<RouteResponseDto> {
    return this.routesService.findOne(id);
  }

  // @Patch(':id')
  // @HttpCode(HttpStatus.OK)
  // async update(
  //   @Param('id') id: string,
  //   @Body() updateRouteDto: UpdateRouteDto,
  // ): Promise<RouteResponseDto> {
  //   return this.routesService.update(id, updateRouteDto);
  // }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    return this.routesService.remove(id);
  }
}
