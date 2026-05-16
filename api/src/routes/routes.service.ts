import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateRouteDto } from './dto/create-route.dto';
import { UpdateRouteDto } from './dto/update-route.dto';
import { RouteNotFoundException } from './exceptions/route.exception';

@Injectable()
export class RoutesService {
  constructor(private prisma: PrismaService) {}

  async create(createRouteDto: CreateRouteDto) {
    return this.prisma.route.create({
      data: createRouteDto,
    });
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
