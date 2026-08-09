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
    // Verifica se cidade existe
    const city = await this.prisma.city.findFirst({
      where: { id: cityId, deleted_at: null },
    });

    if (!city) {
      throw new NotFoundException('Cidade não encontrada');
    }

    // Faz upload para o Cloudinary na pasta da cidade
    const uploaded = await this.cloudinary.uploadImage(
      file,
      `rota-cric/cities/${cityId}`,
    );

    // Salva a URL no banco
    const image = await this.prisma.cityImage.create({
      data: {
        city_id: cityId,
        url: uploaded.secure_url,
        caption: dto.caption,
        order: dto.order ?? 0,
      },
    });

    return new CityImageResponseDto(image);
  }

  async findAllByCityId(cityId: string): Promise<CityImageResponseDto[]> {
    const city = await this.prisma.city.findFirst({
      where: { id: cityId, deleted_at: null },
    });

    if (!city) {
      throw new NotFoundException('Cidade não encontrada');
    }

    const images = await this.prisma.cityImage.findMany({
      where: { city_id: cityId, deleted_at: null, active: true },
      orderBy: { order: 'asc' },
    });

    return images.map((img) => new CityImageResponseDto(img));
  }

  async remove(cityId: string, imageId: string): Promise<void> {
    const image = await this.prisma.cityImage.findFirst({
      where: { id: imageId, city_id: cityId, deleted_at: null },
    });

    if (!image) {
      throw new NotFoundException('Imagem não encontrada');
    }

    // Soft delete
    await this.prisma.cityImage.update({
      where: { id: imageId },
      data: { deleted_at: new Date() },
    });
  }
}
