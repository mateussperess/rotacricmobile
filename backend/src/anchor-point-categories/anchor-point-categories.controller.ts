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

  @Get()
  findAll() {
    return this.anchorPointCategoriesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.anchorPointCategoriesService.findOne(id);
  }
}
