import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CityResponseDto } from 'src/cities/dto/city-response.dto';
import { AnchorPointResponseDto } from 'src/anchor-points/dto/anchor-point-response.dto';
import { AnchorPointCategoryResponseDto } from 'src/anchor-point-categories/dto/anchor-point-category-response.dto';

@Injectable()
export class SyncService {
  constructor(private prisma: PrismaService) {}

  private serializeBigInt(obj: any): any {
    if (obj === null || obj === undefined) return obj;
    if (typeof obj === 'bigint') return obj.toString();
    if (Array.isArray(obj)) return obj.map((item) => this.serializeBigInt(item));
    if (typeof obj === 'object') {
      const res: any = {};
      for (const key of Object.keys(obj)) {
        res[key] = this.serializeBigInt(obj[key]);
      }
      return res;
    }
    return obj;
  }

  async getBootstrapData() {
    const [cities, cityImages, routes, cityRoutes, categories, anchorPoints, stamps] =
      await Promise.all([
        this.prisma.city.findMany({ where: { active: true, visible: true } }),
        this.prisma.cityImage.findMany(),
        this.prisma.route.findMany({ where: { active: true } }),
        this.prisma.cityRoute.findMany(),
        this.prisma.anchorPointCategory.findMany({ where: { is_active: true } }),
        this.prisma.anchorPoint.findMany({ where: { active: true }, include: { category: true } }),
        this.prisma.stamp.findMany({ where: { active: true } }),
      ]);

    const mappedCities = cities.map((c) => new CityResponseDto(c));
    const mappedAnchorPoints = anchorPoints.map((ap) => {
      const dto = new AnchorPointResponseDto(ap);
      return {
        ...dto,
        latitude: dto.lat,
        longitude: dto.lng,
        category: ap.category ? new AnchorPointCategoryResponseDto(ap.category) : null,
      };
    });

    return this.serializeBigInt({
      timestamp: new Date().toISOString(),
      cities: mappedCities,
      cityImages,
      routes,
      cityRoutes,
      categories,
      anchorPoints: mappedAnchorPoints,
      stamps,
    });
  }
}
