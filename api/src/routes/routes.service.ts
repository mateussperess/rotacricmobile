import * as polylineLib from '@mapbox/polyline';
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateRouteDto } from './dto/create-route.dto';
import { RouteResponseDto } from './dto/route-response.dto';
import { UpdateRouteDto } from './dto/update-route.dto';
import {
  RouteAlreadyExistsException,
  RouteNotFoundException,
} from './exceptions/route.exception';

@Injectable()
export class RoutesService {
  constructor(private prisma: PrismaService) {}

  private decodePolylineDistance(polyline: string): number {
    const coords = polylineLib.decode(polyline); // [[lat, lng], ...]

    let totalDistance = 0;
    for (let i = 1; i < coords.length; i++) {
      totalDistance += this.haversine(coords[i - 1], coords[i]);
    }

    return Math.round(totalDistance * 100) / 100; // km, 2 casas decimais
  }

  private haversine(
    [lat1, lon1]: [number, number],
    [lat2, lon2]: [number, number],
  ): number {
    const R = 6371; // raio da tera em km
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(this.toRad(lat1)) *
        Math.cos(this.toRad(lat2)) *
        Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  private toRad(deg: number): number {
    return (deg * Math.PI) / 180;
  }

  async create(createRouteDto: CreateRouteDto) {
    const existingRoute = await this.prisma.route.findFirst({
      where: {
        OR: [
          { name: createRouteDto.name },
          { strava_id: createRouteDto.strava_id },
          { polyline: createRouteDto.polyline },
        ],
      },
    });

    if (existingRoute) {
      if (existingRoute.name == createRouteDto.name) {
        throw new RouteAlreadyExistsException('Nome');
      }
      if (existingRoute.strava_id == createRouteDto.strava_id) {
        throw new RouteAlreadyExistsException('ID do Strava');
      }
      if (existingRoute.polyline == createRouteDto.polyline) {
        throw new RouteAlreadyExistsException('Polyline');
      }
    }

    const distance = this.decodePolylineDistance(createRouteDto.polyline);

    const route = await this.prisma.route.create({
      data: { ...createRouteDto, distance },
    });

    return new RouteResponseDto(route);
  }

  async findAll() {
    return this.prisma.route.findMany({
      where: { deleted_at: null },
    });
  }

  async findOne(id: string) {
    const route = await this.prisma.route.findFirst({
      where: { id, deleted_at: null },
    });

    if (!route) {
      throw new RouteNotFoundException();
    }

    return route;
  }

  async update(id: string, updateRouteDto: UpdateRouteDto) {
    const route = await this.prisma.route.findFirst({
      where: { id, deleted_at: null },
    });

    if (!route) {
      throw new RouteNotFoundException();
    }

    return this.prisma.route.update({
      where: { id },
      data: updateRouteDto,
    });
  }

  async remove(id: string) {
    const route = await this.prisma.route.findFirst({
      where: { id, deleted_at: null },
    });

    if (!route) {
      throw new RouteNotFoundException();
    }

    await this.prisma.route.update({
      where: { id },
      data: { deleted_at: new Date() },
    });

    return { message: 'Rota deletada com sucesso' };
  }
}
