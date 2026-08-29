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

  async findByRoute(routeId: string) {
    return [];
  }

  async findDestinationsFromCity(cityId: string, routeId?: string) {
    return [];
  }

  async findOne(id: string) {
    throw new NotFoundException(`Segmento ${id} não encontrado.`);
  }

  async remove(id: string) {
    return { message: 'Segmento removido' };
  }

  async getTotalDistance(): Promise<{
    totalKm: number;
    segmentCount: number;
    segments: { from: string; to: string; distanceKm: number }[];
  }> {
    const routes = await this.prisma.route.findMany({
      where: { active: true },
    });

    let totalKm = 0;
    for (const r of routes) {
      if (r.distance) {
        totalKm += parseFloat(r.distance) || 0;
      }
    }
    totalKm = Math.round(totalKm * 100) / 100;

    return {
      totalKm,
      segmentCount: routes.length,
      segments: [],
    };
  }
}
