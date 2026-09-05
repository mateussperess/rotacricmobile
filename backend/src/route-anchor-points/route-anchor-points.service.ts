import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateRouteAnchorPointDto } from './dto/create-route-anchor-point.dto';
import { UpdateRouteAnchorPointDto } from './dto/update-route-anchor-point.dto';

@Injectable()
export class RouteAnchorPointsService {
  constructor(private prisma: PrismaService) {}

  async findAll(route_id?: string) {
    return [];
  }

  async findOne(id: string) {
    throw new NotFoundException('Associação não encontrada');
  }

  async remove(id: string) {
    return { message: 'Associação removida' };
  }
}
