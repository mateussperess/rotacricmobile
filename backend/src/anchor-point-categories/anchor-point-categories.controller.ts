import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { AnchorPointCategoriesService } from './anchor-point-categories.service';
import { AnchorPointCategoryResponseDto } from './dto/anchor-point-category-response.dto';
import { CreateAnchorPointCategoryDto } from './dto/create-anchor-point-category.dto';
import { UpdateAnchorPointCategoryDto } from './dto/update-anchor-point-category.dto';

@Controller('anchor-point-categories')
export class AnchorPointCategoriesController {
  constructor(
    private readonly anchorPointCategoriesService: AnchorPointCategoriesService,
  ) {}

  @Post()
  create(
    @Body() createAnchorPointCategoryDto: CreateAnchorPointCategoryDto,
  ): Promise<AnchorPointCategoryResponseDto> {
    return this.anchorPointCategoriesService.create(
      createAnchorPointCategoryDto,
    );
  }

  @Get()
  findAll() {
    return this.anchorPointCategoriesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.anchorPointCategoriesService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateAnchorPointCategoryDto: UpdateAnchorPointCategoryDto,
  ) {
    return this.anchorPointCategoriesService.update(
      id,
      updateAnchorPointCategoryDto,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.anchorPointCategoriesService.remove(id);
  }
}
