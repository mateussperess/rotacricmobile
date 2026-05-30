import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { AnchorPointsService } from './anchor-points.service';
import { AnchorPointResponseDto } from './dto/anchor-point-response.dto';
import { CreateAnchorPointDto } from './dto/create-anchor-point.dto';
import { UpdateAnchorPointDto } from './dto/update-anchor-point.dto';

@Controller('anchor-points')
export class AnchorPointsController {
  constructor(private readonly anchorPointsService: AnchorPointsService) {}

  @Post()
  create(
    @Body() createAnchorPointDto: CreateAnchorPointDto,
  ): Promise<AnchorPointResponseDto> {
    return this.anchorPointsService.create(createAnchorPointDto);
  }

  @Get()
  findAll() {
    return this.anchorPointsService.findAll();
  }

  @Get('city/:city_id')
  findAllByCity(@Param('city_id') city_id: string) {
    return this.anchorPointsService.findAllByCity(city_id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.anchorPointsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateAnchorPointDto: UpdateAnchorPointDto,
  ) {
    return this.anchorPointsService.update(id, updateAnchorPointDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.anchorPointsService.remove(id);
  }
}
