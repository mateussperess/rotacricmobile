import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CityResponseDto } from './dto/city-response.dto';

function toBigInt(id: string | number): bigint {
  return BigInt(id);
}

@Injectable()
export class CitiesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    const cities = await this.prisma.city.findMany({
      where: { active: true, visible: true },
      orderBy: { name: 'asc' },
    });
    return cities.map((city) => new CityResponseDto(city));
  }

  async findByName(name: string) {
    const city = await this.prisma.city.findFirst({
      where: { name: { contains: name }, active: true, visible: true },
    });

    if (!city) {
      throw new NotFoundException(`Cidade "${name}" não encontrada`);
    }

    return new CityResponseDto(city);
  }

  async findOne(id: string) {
    try {
      const city = await this.prisma.city.findFirst({
        where: { id: toBigInt(id), active: true, visible: true },
      });

      if (!city) {
        throw new NotFoundException('Cidade não encontrada');
      }

      return new CityResponseDto(city);
    } catch {
      throw new NotFoundException('Cidade não encontrada');
    }
  }
}

