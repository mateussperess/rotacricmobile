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
}
