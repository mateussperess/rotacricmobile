import { Module } from '@nestjs/common';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { CityImagesService } from './ city-images.service';
import { CitiesController } from './cities.controller';
import { CitiesService } from './cities.service';
import { CityImagesController } from './city-images.controller';

@Module({
  imports: [PrismaModule, CloudinaryModule],
  controllers: [CitiesController, CityImagesController],
  providers: [CitiesService, CityImagesService],
})
export class CitiesModule {}
