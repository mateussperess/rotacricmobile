import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateRouteSegmentDto } from './dto/create-route-segment.dto';
import { RouteSegmentResponseDto } from './dto/route-segment-response.dto';

@Injectable()
export class RouteSegmentsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateRouteSegmentDto) {
    if (dto.from_city_id === dto.to_city_id) {
      throw new BadRequestException(
        'from_city_id e to_city_id não podem ser iguais.',
      );
    }

    // validando se a rota e cidades existem
    const [route, fromCity, toCity] = await Promise.all([
      this.prisma.route.findUnique({ where: { id: dto.route_id } }),
      this.prisma.city.findUnique({ where: { id: dto.from_city_id } }),
      this.prisma.city.findUnique({ where: { id: dto.to_city_id } }),
    ]);

    if (!route)
      throw new NotFoundException(`Rota ${dto.route_id} não encontrada.`);
    if (!fromCity)
      throw new NotFoundException(
        `Cidade de origem ${dto.from_city_id} não encontrada.`,
      );
    if (!toCity)
      throw new NotFoundException(
        `Cidade de destino ${dto.to_city_id} não encontrada.`,
      );

    const existing = await this.prisma.routeSegment.findFirst({
      where: {
        route_id: dto.route_id,
        from_city_id: dto.from_city_id,
        to_city_id: dto.to_city_id,
        deleted_at: null,
      },
    });

    if (existing) {
      throw new BadRequestException(
        'Já existe um segmento com essa rota e cidades informadas.',
      );
    }

    const routeSegment = await this.prisma.routeSegment.create({
      data: {
        route_id: dto.route_id,
        from_city_id: dto.from_city_id,
        to_city_id: dto.to_city_id,
        distance: route.distance,
      },
      include: {
        route: true,
        from_city: true,
        to_city: true,
      },
    });

    return new RouteSegmentResponseDto(routeSegment);
  }

  async findByRoute(routeId: string) {
    return this.prisma.routeSegment.findMany({
      where: {
        route_id: routeId,
        deleted_at: null,
      },
      include: {
        from_city: true,
        to_city: true,
      },
    });
  }

  async findDestinationsFromCity(cityId: string, routeId?: string) {
    return this.prisma.routeSegment.findMany({
      where: {
        from_city_id: cityId,
        deleted_at: null,
        ...(routeId ? { route_id: routeId } : {}),
      },
      include: {
        to_city: true,
        route: true,
      },
    });
  }

  async findOne(id: string) {
    const segment = await this.prisma.routeSegment.findUnique({
      where: { id },
      include: {
        route: true,
        from_city: true,
        to_city: true,
      },
    });
    if (!segment) throw new NotFoundException(`Segmento ${id} não encontrado.`);
    return segment;
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.routeSegment.update({
      where: { id },
      data: { deleted_at: new Date() },
    });
  }

  async getTotalDistance(): Promise<{
    totalKm: number;
    segmentCount: number;
    segments: { from: string; to: string; distanceKm: number }[];
  }> {
    const segments = await this.prisma.routeSegment.findMany({
      where: { deleted_at: null },
      include: {
        from_city: { select: { name: true } },
        to_city: { select: { name: true } },
      },
      orderBy: { created_at: 'asc' },
    });

    const mapped = segments.map((s) => ({
      from: s.from_city.name,
      to: s.to_city.name,
      distanceKm: s.distance ?? 0,
    }));

    const totalKm =
      Math.round(mapped.reduce((acc, s) => acc + s.distanceKm, 0) * 100) / 100;

    return {
      totalKm,
      segmentCount: segments.length,
      segments: mapped,
    };
  }
}
