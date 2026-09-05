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

  async findAll() {
    const routes = await this.prisma.route.findMany({
      where: { active: true },
    });
    return routes.map((route) => new RouteResponseDto(route));
  }

  async findOne(id: string) {
    try {
      const route = await this.prisma.route.findFirst({
        where: { id: BigInt(id), active: true },
      });

      if (!route) {
        throw new RouteNotFoundException();
      }

      return new RouteResponseDto(route);
    } catch {
      throw new RouteNotFoundException();
    }
  }
}
