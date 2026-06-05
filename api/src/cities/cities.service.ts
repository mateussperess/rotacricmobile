import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { distanceInsideRadius } from 'src/utils/geo.utils';
import { CityResponseDto } from './dto/city-response.dto';
import { CreateCityDto } from './dto/create-city.dto';
import { UpdateCityDto } from './dto/update-city.dto';
import { CityNameAlreadyExistsException } from './exceptions/city.exception';

@Injectable()
export class CitiesService {
  constructor(private prisma: PrismaService) {}

  async create(createCityDto: CreateCityDto) {
    const existingCity = await this.prisma.city.findFirst({
      where: { name: createCityDto.name, deleted_at: null },
    });

    if (existingCity) {
      throw new CityNameAlreadyExistsException(createCityDto.name);
    }

    const city = await this.prisma.city.create({ data: createCityDto });
    return new CityResponseDto(city);
  }

  async findAll() {
    const cities = await this.prisma.city.findMany({
      where: { deleted_at: null },
    });
    return cities.map((city) => new CityResponseDto(city));
  }

  async findByName(name: string) {
    const city = await this.prisma.city.findFirst({
      where: { name: { contains: name }, deleted_at: null },
    });

    if (!city) {
      throw new NotFoundException(`Cidade "${name}" não encontrada`);
    }

    return new CityResponseDto(city);
  }

  async findOne(id: string) {
    const city = await this.prisma.city.findFirst({
      where: { id, deleted_at: null },
    });

    if (!city) {
      throw new NotFoundException('Cidade não encontrada');
    }

    return new CityResponseDto(city);
  }

  async update(id: string, updateCityDto: UpdateCityDto) {
    await this.findOne(id);

    const city = await this.prisma.city.update({
      where: { id },
      data: updateCityDto,
    });

    return new CityResponseDto(city);
  }

  async remove(id: string) {
    await this.findOne(id);

    await this.prisma.city.update({
      where: { id },
      data: { deleted_at: new Date() },
    });
  }

  async getRouteDistanceThruCity(
    cityId: string,
    radiusKm: number = 8,
  ): Promise<{
    cityId: string;
    cityName: string;
    radiusKm: number;
    routes: {
      routeId: string;
      routeName: string;
      distanceKm: number;
    }[];
    totalDistanceKm: number;
  }> {
    // 1. Busca a cidade
    const city = await this.prisma.city.findUnique({
      where: { id: cityId },
    });

    if (!city) {
      throw new NotFoundException(`Cidade ${cityId} não encontrada.`);
    }

    // 2. Busca todos os segmentos onde a cidade aparece como origem OU destino
    //    e inclui a rota associada (com o polyline)
    const segments = await this.prisma.routeSegment.findMany({
      where: {
        deleted_at: null,
        OR: [{ from_city_id: cityId }, { to_city_id: cityId }],
      },
      include: {
        route: true,
      },
    });

    if (segments.length === 0) {
      return {
        cityId: city.id,
        cityName: city.name,
        radiusKm,
        routes: [],
        totalDistanceKm: 0,
      };
    }

    // 3. Deduplica as rotas (uma rota pode ter múltiplos segmentos passando pela cidade)
    const routeMap = new Map<
      string,
      { routeId: string; routeName: string; polyline: string }
    >();

    for (const segment of segments) {
      if (!routeMap.has(segment.route.id)) {
        routeMap.set(segment.route.id, {
          routeId: segment.route.id,
          routeName: segment.route.name,
          polyline: segment.route.polyline,
        });
      }
    }

    // 4. Para cada rota única, calcula a distância dentro do raio da cidade
    const routes = Array.from(routeMap.values()).map(
      ({ routeId, routeName, polyline }) => ({
        routeId,
        routeName,
        distanceKm: distanceInsideRadius(
          polyline,
          city.lat,
          city.lng,
          radiusKm,
        ),
      }),
    );

    const totalDistanceKm =
      Math.round(routes.reduce((acc, r) => acc + r.distanceKm, 0) * 100) / 100;

    return {
      cityId: city.id,
      cityName: city.name,
      radiusKm,
      routes,
      totalDistanceKm,
    };
  }
}
