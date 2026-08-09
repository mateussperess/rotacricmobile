import { PartialType } from '@nestjs/mapped-types';
import { CreateAnchorPointCategoryDto } from './create-anchor-point-category.dto';

export class UpdateAnchorPointCategoryDto extends PartialType(CreateAnchorPointCategoryDto) {}
