import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AnchorPointCategoryResponseDto } from './dto/anchor-point-category-response.dto';
import { CreateAnchorPointCategoryDto } from './dto/create-anchor-point-category.dto';
import { UpdateAnchorPointCategoryDto } from './dto/update-anchor-point-category.dto';

@Injectable()
export class AnchorPointCategoriesService {
  constructor(private prisma: PrismaService) {}

  async create(createAnchorPointCategoryDto: CreateAnchorPointCategoryDto) {
    const existingCategory = await this.prisma.anchorPointCategory.findFirst({
      where: { name: createAnchorPointCategoryDto.name },
    });

    if (existingCategory) {
      throw new ConflictException('Categoria de ponto de ancoragem já existe');
    }

    const category = await this.prisma.anchorPointCategory.create({
      data: createAnchorPointCategoryDto,
    });

    return new AnchorPointCategoryResponseDto(category);
  }

  async findAll() {
    const categories = await this.prisma.anchorPointCategory.findMany({
      where: { deleted_at: null },
    });

    return categories.map((cat) => new AnchorPointCategoryResponseDto(cat));
  }

  async findOne(id: string) {
    const category = await this.prisma.anchorPointCategory.findFirst({
      where: { id, deleted_at: null },
    });

    if (!category) {
      throw new NotFoundException('Categoria não encontrada');
    }
    return new AnchorPointCategoryResponseDto(category);
  }

  async update(
    id: string,
    updateAnchorPointCategoryDto: UpdateAnchorPointCategoryDto,
  ) {
    await this.findOne(id);

    const category = await this.prisma.anchorPointCategory.update({
      where: { id },
      data: updateAnchorPointCategoryDto,
    });

    return new AnchorPointCategoryResponseDto(category);
  }

  async remove(id: string) {
    await this.findOne(id);

    await this.prisma.anchorPointCategory.update({
      where: { id },
      data: { deleted_at: new Date() },
    });
  }
}
