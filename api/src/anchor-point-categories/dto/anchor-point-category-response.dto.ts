import { AnchorPointCategory } from '../entities/anchor-point-category.entity';

export class AnchorPointCategoryResponseDto {
  id: string;
  name: string;
  icon_name: string;
  icon_image: string | null;
  active: boolean;
  created_at: Date;
  updated_at: Date;

  constructor(anchorPointCategory: AnchorPointCategory) {
    this.id = anchorPointCategory.id;
    this.name = anchorPointCategory.name;
    this.icon_name = anchorPointCategory.icon_name;
    this.icon_image = anchorPointCategory.icon_image;
    this.active = anchorPointCategory.active;
    this.created_at = anchorPointCategory.created_at;
    this.updated_at = anchorPointCategory.updated_at;
  }
}
