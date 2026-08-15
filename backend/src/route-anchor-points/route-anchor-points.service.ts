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

  async create(createRouteAnchorPointDto: CreateRouteAnchorPointDto) {
    const { route_id, anchor_point_id, on_route } = createRouteAnchorPointDto;

    const route = await this.prisma.route.findFirst({
      where: { id: route_id, deleted_at: null },
    });

    if (!route) {
      throw new NotFoundException('Rota não encontrada');
    }

    const anchorPoint = await this.prisma.anchorPoint.findFirst({
      where: { id: anchor_point_id, deleted_at: null },
    });

    if (!anchorPoint) {
      throw new NotFoundException('Ponto de apoio não encontrado');
    }

    const existingRouteAnchorPoint =
      await this.prisma.routeAnchorPoint.findFirst({
        where: { route_id, anchor_point_id },
      });

    if (existingRouteAnchorPoint) {
      throw new ConflictException(
        'Este ponto de apoio já está associado a esta rota',
      );
    }

    return this.prisma.routeAnchorPoint.create({
      data: {
        route_id,
        anchor_point_id,
        on_route: on_route ?? false,
      },
    });
  }

  async findAll(route_id?: string) {
    return this.prisma.routeAnchorPoint.findMany({
      where: {
        deleted_at: null,
        ...(route_id && { route_id }),
      },
      include: {
        anchor_point: true,
      },
    });
  }

  async findOne(id: string) {
    const routeAnchorPoint = await this.prisma.routeAnchorPoint.findFirst({
      where: { id, deleted_at: null },
      include: {
        anchor_point: true,
        route: true,
      },
    });

    if (!routeAnchorPoint) {
      throw new NotFoundException('Associação não encontrada');
    }

    return routeAnchorPoint;
  }

  async update(
    id: string,
    updateRouteAnchorPointDto: UpdateRouteAnchorPointDto,
  ) {
    await this.findOne(id);

    return this.prisma.routeAnchorPoint.update({
      where: { id },
      data: updateRouteAnchorPointDto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    await this.prisma.routeAnchorPoint.update({
      where: { id },
      data: { deleted_at: new Date() },
    });
  }
}
