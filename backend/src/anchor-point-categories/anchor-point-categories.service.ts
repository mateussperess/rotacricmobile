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

  async findAll() {
    const categories = await this.prisma.anchorPointCategory.findMany({
      where: { is_active: true },
    });

    return categories.map((cat) => new AnchorPointCategoryResponseDto(cat));
  }

  async findOne(id: string) {
    try {
      const category = await this.prisma.anchorPointCategory.findFirst({
        where: { id: BigInt(id), is_active: true },
      });

      if (!category) {
        throw new NotFoundException('Categoria não encontrada');
      }
      return new AnchorPointCategoryResponseDto(category);
    } catch {
      throw new NotFoundException('Categoria não encontrada');
    }
  }
}
