import { PartialType } from '@nestjs/mapped-types';
import { CreateAnchorPointDto } from './create-anchor-point.dto';

export class UpdateAnchorPointDto extends PartialType(CreateAnchorPointDto) {
  name?: string;
  lat?: number;
  lng?: number;
  business_hours?: string;
  phone?: string;
  image?: string;
  category_id?: string;
  active?: boolean;
}
