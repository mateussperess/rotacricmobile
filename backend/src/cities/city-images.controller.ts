import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { CreateCityImageDto } from '../cloudinary/create-city-image.dto';
import { CityImagesService } from './city-images.service';

@Controller('cities/:cityId/images')
export class CityImagesController {
  constructor(private readonly cityImagesService: CityImagesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('image', { storage: memoryStorage() }))
  upload(
    @Param('cityId') cityId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: CreateCityImageDto,
  ) {
    return this.cityImagesService.upload(cityId, file, dto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  findAll(@Param('cityId') cityId: string) {
    return this.cityImagesService.findAllByCityId(cityId);
  }

  @Delete(':imageId')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('cityId') cityId: string, @Param('imageId') imageId: string) {
    return this.cityImagesService.remove(cityId, imageId);
  }
}
