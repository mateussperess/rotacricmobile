import { PartialType } from '@nestjs/mapped-types';
import { CreateRouteSegmentDto } from './create-route-segment.dto';

export class UpdateRouteSegmentDto extends PartialType(CreateRouteSegmentDto) {}
