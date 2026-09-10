import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AnchorPointCategoryResponseDto } from 'src/anchor-point-categories/dto/anchor-point-category-response.dto';
import { AnchorPointResponseDto } from './dto/anchor-point-response.dto';

@Injectable()
export class AnchorPointsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    const anchorPoints = await this.prisma.anchorPoint.findMany({
      where: { active: true },
      include: { category: true },
    });

    return anchorPoints.map((ap) => ({
      ...new AnchorPointResponseDto(ap),
      category: ap.category ? new AnchorPointCategoryResponseDto(ap.category) : null,
    }));
  }

  async findAllByCity(city_id: string) {
    let numericCityId: bigint;
    try {
      numericCityId = BigInt(city_id);
    } catch {
      return [];
    }

    const anchorPoints = await this.prisma.anchorPoint.findMany({
      where: { city_id: numericCityId, active: true },
      include: { category: true },
    });

    return anchorPoints.map((ap) => ({
      ...new AnchorPointResponseDto(ap),
      category: ap.category ? new AnchorPointCategoryResponseDto(ap.category) : null,
      on_route: false,
    }));
  }

  async findOne(id: string) {
    try {
      const anchorPoint = await this.prisma.anchorPoint.findFirst({
        where: { id: BigInt(id), active: true },
        include: { category: true },
      });

      if (!anchorPoint) {
        throw new NotFoundException('Ponto de apoio não encontrado');
      }

      return {
        ...new AnchorPointResponseDto(anchorPoint),
        category: anchorPoint.category ? new AnchorPointCategoryResponseDto(anchorPoint.category) : null,
      };
    } catch {
      throw new NotFoundException('Ponto de apoio não encontrado');
    }
  }

  async findAllAdmin() {
    const anchorPoints = await this.prisma.anchorPoint.findMany({
      include: { category: true },
      orderBy: { id: "desc" },
    });

    return anchorPoints.map((ap) => ({
      ...new AnchorPointResponseDto(ap),
      category: ap.category ? new AnchorPointCategoryResponseDto(ap.category) : null,
    }));
  }

  async toggleActive(id: string) {
    let numericId: bigint;
    try {
      numericId = BigInt(id);
    } catch {
      throw new NotFoundException('Ponto de apoio não encontrado');
    }

    const ap = await this.prisma.anchorPoint.findUnique({
      where: { id: numericId },
    });
    if (!ap) {
      throw new NotFoundException('Ponto de apoio não encontrado');
    }

    const updated = await this.prisma.anchorPoint.update({
      where: { id: numericId },
      data: { active: !ap.active },
      include: { category: true },
    });

    return {
      ...new AnchorPointResponseDto(updated),
      category: updated.category ? new AnchorPointCategoryResponseDto(updated.category) : null,
    };
  }

  async remove(id: string) {
    let numericId: bigint;
    try {
      numericId = BigInt(id);
    } catch {
      throw new NotFoundException('Ponto de apoio não encontrado');
    }

    const ap = await this.prisma.anchorPoint.findUnique({
      where: { id: numericId },
    });
    if (!ap) {
      throw new NotFoundException('Ponto de apoio não encontrado');
    }

    await this.prisma.anchorPoint.delete({
      where: { id: numericId },
    });

    return { message: 'Ponto de apoio removido com sucesso' };
  }

  async create(dto: any) {
    let numericCityId: bigint | null = null;
    if (dto.city_id) {
      try {
        numericCityId = BigInt(dto.city_id);
      } catch {}
    }

    let numericCategoryId: bigint;
    try {
      numericCategoryId = BigInt(dto.category_id || 1);
    } catch {
      numericCategoryId = BigInt(1);
    }

    const created = await this.prisma.anchorPoint.create({
      data: {
        name: dto.name,
        latitude: dto.lat !== undefined ? Number(dto.lat) : null,
        longitude: dto.lng !== undefined ? Number(dto.lng) : null,
        business_hours: dto.business_hours || null,
        phone: dto.phone || null,
        image: dto.image || 'anchorpoints/default.jpg',
        is_event_anchorpoint: false,
        active: true,
        anchorpoint_category_id: numericCategoryId,
        city_id: numericCityId,
      },
      include: { category: true },
    });

    return {
      ...new AnchorPointResponseDto(created),
      category: created.category ? new AnchorPointCategoryResponseDto(created.category) : null,
    };
  }
}
