import { Injectable } from '@nestjs/common';
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
      where: {
        name: createCityDto.name,
      },
    });

    if (existingCity) {
      throw new CityNameAlreadyExistsException(createCityDto.name);
    }
    const city = await this.prisma.city.create({ data: createCityDto });
    return new CityResponseDto(city);
  }

  async findAll() {
    const cities = await this.prisma.city.findMany();
    return cities.map((city) => new CityResponseDto(city));
  }

  findOne(id: number) {
    return `This action returns a #${id} city`;
  }

  update(id: number, updateCityDto: UpdateCityDto) {
    return `This action updates a #${id} city`;
  }

  remove(id: number) {
    return `This action removes a #${id} city`;
  }
}
