export class AnchorPointCategoryResponseDto {
  id: string;
  name: string;
  icon_name: string;
  icon_image: string | null;
  active: boolean;
  created_at: Date;
  updated_at: Date;

  constructor(cat: any) {
    this.id = cat.id?.toString() ?? '';
    this.name = cat.name ?? '';
    this.icon_name = cat.icon_name ?? '';
    this.icon_image = null;
    this.active = Boolean(cat.is_active ?? cat.active ?? true);
    this.created_at = cat.created_at ?? new Date();
    this.updated_at = cat.updated_at ?? new Date();
  }
}
