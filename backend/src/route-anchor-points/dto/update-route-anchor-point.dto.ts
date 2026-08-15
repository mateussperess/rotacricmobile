import { PartialType } from '@nestjs/mapped-types';
import { CreateRouteAnchorPointDto } from './create-route-anchor-point.dto';

export class UpdateRouteAnchorPointDto extends PartialType(CreateRouteAnchorPointDto) {}
