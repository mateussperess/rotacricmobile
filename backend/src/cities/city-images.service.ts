import { Injectable, NotFoundException } from '@nestjs/common';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCityImageDto } from '../cloudinary/create-city-image.dto';
import { CityImageResponseDto } from './dto/city-image-response.dto';

@Injectable()
export class CityImagesService {
  constructor(
    private prisma: PrismaService,
    private cloudinary: CloudinaryService,
  ) {}

  async upload(
    cityId: string,
    file: Express.Multer.File,
    dto: CreateCityImageDto,
  ): Promise<CityImageResponseDto> {
    const numericCityId = BigInt(cityId);
    const uploaded = await this.cloudinary.uploadImage(
      file,
      `rota-cric/cities/${cityId}`,
    );

    const image = await this.prisma.cityImage.create({
      data: {
        city_id: numericCityId,
        image_path: uploaded.secure_url,
        title: dto.caption ?? null,
      },
    });

    return new CityImageResponseDto(image);
  }

  async findAllByCityId(cityId: string): Promise<CityImageResponseDto[]> {
    let numericCityId: bigint;
    try {
      numericCityId = BigInt(cityId);
    } catch {
      return [];
    }

    const images = await this.prisma.cityImage.findMany({
      where: { city_id: numericCityId },
    });

    return images.map((img) => new CityImageResponseDto(img));
  }

  async remove(cityId: string, imageId: string): Promise<void> {
    const numericImageId = BigInt(imageId);
    const image = await this.prisma.cityImage.findFirst({
      where: { id: numericImageId },
    });

    if (!image) {
      throw new NotFoundException('Imagem não encontrada');
    }

    await this.prisma.cityImage.delete({
      where: { id: numericImageId },
    });
  }
}
