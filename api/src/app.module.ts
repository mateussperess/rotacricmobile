import { Module } from '@nestjs/common';
import { AnchorPointCategoriesModule } from './anchor-point-categories/anchor-point-categories.module';
import { AnchorPointsModule } from './anchor-points/anchor-points.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { CitiesModule } from './cities/cities.module';
import { PrismaModule } from './prisma/prisma.module';
import { PrismaService } from './prisma/prisma.service';
import { RoutesModule } from './routes/routes.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    PrismaModule,
    UsersModule,
    AuthModule,
    RoutesModule,
    CitiesModule,
    AnchorPointCategoriesModule,
    AnchorPointsModule,
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
