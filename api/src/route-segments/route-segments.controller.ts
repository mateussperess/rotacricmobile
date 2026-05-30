import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { CreateRouteSegmentDto } from './dto/create-route-segment.dto';
import { RouteSegmentResponseDto } from './dto/route-segment-response.dto';
import { RouteSegmentsService } from './route-segments.service';

@Controller('route-segments')
export class RouteSegmentsController {
  constructor(private readonly routeSegmentsService: RouteSegmentsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @Body() createRouteSegmentDto: CreateRouteSegmentDto,
  ): Promise<RouteSegmentResponseDto> {
    return this.routeSegmentsService.create(createRouteSegmentDto);
  }

  /**
   * GET /route-segments?routeId=xxx
   * Lista todos os segmentos de uma rota.
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  findByRoute(@Query('routeId') routeId: string) {
    return this.routeSegmentsService.findByRoute(routeId);
  }

  /**
   * GET /route-segments/from/:cityId?routeId=xxx
   * Retorna todos os destinos possíveis a partir de uma cidade.
   * O routeId é opcional — sem ele, retorna destinos em todas as rotas.
   */
  @Get('from/:cityId')
  @HttpCode(HttpStatus.OK)
  findDestinations(
    @Param('cityId') cityId: string,
    @Query('routeId') routeId?: string,
  ) {
    return this.routeSegmentsService.findDestinationsFromCity(cityId, routeId);
  }

  /**
   * GET /route-segments/:id
   * Retorna um segmento específico.
   */
  @Get(':id')
  @HttpCode(HttpStatus.FOUND)
  findOne(@Param('id') id: string) {
    return this.routeSegmentsService.findOne(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(@Param('id') id: string) {
    return this.routeSegmentsService.remove(id);
  }
}
