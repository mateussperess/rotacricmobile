import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AnchorPointResponseDto } from './dto/anchor-point-response.dto';
import { CreateAnchorPointDto } from './dto/create-anchor-point.dto';
import { UpdateAnchorPointDto } from './dto/update-anchor-point.dto';

@Injectable()
export class AnchorPointsService {
  constructor(private prisma: PrismaService) {}

  async create(createAnchorPointDto: CreateAnchorPointDto) {
    const { city_id, ...rest } = createAnchorPointDto;

    const anchorPointData = {
      name: rest.name,
      lat: rest.lat,
      lng: rest.lng,
      business_hours: rest.business_hours ?? null,
      phone: rest.phone ?? null,
      image: rest.image ?? null,
      category_id: rest.category_id ?? null,
    };

    const city = await this.prisma.city.findFirst({
      where: { id: city_id, deleted_at: null },
    });

    if (!city) {
      throw new NotFoundException('Cidade não encontrada');
    }

    if (createAnchorPointDto.category_id) {
      const category = await this.prisma.anchorPointCategory.findFirst({
        where: { id: createAnchorPointDto.category_id, deleted_at: null },
      });

      if (!category) {
        throw new NotFoundException('Categoria não encontrada');
      }
    }

    const existingAnchorPoint = await this.prisma.anchorPoint.findFirst({
      where: {
        OR: [
          { name: anchorPointData.name },
          { lat: anchorPointData.lat, lng: anchorPointData.lng },
        ],
        deleted_at: null,
      },
    });

    if (existingAnchorPoint) {
      throw new ConflictException(
        'Já existe um ponto de apoio com esse nome ou nessas coordenadas',
      );
    }

    const anchorPoint = await this.prisma.$transaction(async (tx) => {
      const created = await tx.anchorPoint.create({
        data: anchorPointData,
      });

      await tx.cityAnchorpoint.create({
        data: {
          city_id,
          anchor_point_id: created.id,
        },
      });

      return created;
    });

    return new AnchorPointResponseDto(anchorPoint);
  }

  async findAll() {
    const anchorPoints = await this.prisma.anchorPoint.findMany({
      where: { deleted_at: null },
    });

    return anchorPoints.map((ap) => new AnchorPointResponseDto(ap));
  }

  async findAllByCity(city_id: string) {
    const city = await this.prisma.city.findFirst({
      where: { id: city_id, deleted_at: null },
    });

    if (!city) {
      throw new NotFoundException('Cidade não encontrada');
    }

    const cityAnchorpoints = await this.prisma.cityAnchorpoint.findMany({
      where: { city_id, deleted_at: null },
      include: { anchor_point: true },
    });

    return cityAnchorpoints
      .filter((ca) => ca.anchor_point.deleted_at === null)
      .map((ca) => new AnchorPointResponseDto(ca.anchor_point));
  }

  async findOne(id: string) {
    const anchorPoint = await this.prisma.anchorPoint.findFirst({
      where: { id, deleted_at: null },
    });

    if (!anchorPoint) {
      throw new NotFoundException('Ponto de apoio não encontrado');
    }

    return new AnchorPointResponseDto(anchorPoint);
  }

  async update(id: string, updateAnchorPointDto: UpdateAnchorPointDto) {
    await this.findOne(id);

    if (updateAnchorPointDto.category_id) {
      const category = await this.prisma.anchorPointCategory.findFirst({
        where: { id: updateAnchorPointDto.category_id, deleted_at: null },
      });

      if (!category) {
        throw new NotFoundException('Categoria não encontrada');
      }
    }

    const anchorPoint = await this.prisma.anchorPoint.update({
      where: { id },
      data: updateAnchorPointDto,
    });

    return new AnchorPointResponseDto(anchorPoint);
  }

  async remove(id: string) {
    await this.findOne(id);

    await this.prisma.anchorPoint.update({
      where: { id },
      data: { deleted_at: new Date() },
    });
  }
}
