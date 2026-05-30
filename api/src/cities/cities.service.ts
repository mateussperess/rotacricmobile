import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
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
}
