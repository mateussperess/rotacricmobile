import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateStampDto } from './dto/create-stamp.dto';
import { SyncStampsDto } from './dto/sync-stamps.dto';

@Injectable()
export class StampsService {
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

  async createStamp(dto: CreateStampDto) {
    const anchorPoint = await this.prisma.anchorPoint.findUnique({
      where: { id: BigInt(dto.anchor_point_id) },
    });

    if (!anchorPoint) {
      throw new NotFoundException(`Ponto de Apoio com ID ${dto.anchor_point_id} não encontrado.`);
    }

    const qrCodeToken =
      dto.qr_code_token ||
      `ROTACRIC-STAMP-${dto.anchor_point_id}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const badgeImage = dto.badge_image || 'stamps/default_stamp.png';

    const stamp = await this.prisma.stamp.create({
      data: {
        anchor_point_id: BigInt(dto.anchor_point_id),
        qr_code_token: qrCodeToken,
        name: dto.name,
        badge_image: badgeImage,
        active: true,
      },
    });

    return this.serializeBigInt(stamp);
  }

  async findAllStamps() {
    const stamps = await this.prisma.stamp.findMany({
      where: { active: true },
      include: { anchor_point: true },
    });
    return this.serializeBigInt(stamps);
  }

  async findStampByAnchorPoint(anchorPointId: number) {
    const stamp = await this.prisma.stamp.findFirst({
      where: {
        anchor_point_id: BigInt(anchorPointId),
        active: true,
      },
      include: { anchor_point: true },
    });

    if (!stamp) {
      throw new NotFoundException(`Nenhum carimbo ativo para o Ponto de Apoio ID ${anchorPointId}.`);
    }

    return this.serializeBigInt(stamp);
  }

  async syncOfflineStamps(userId: number, dto: SyncStampsDto) {
    let syncedCount = 0;
    let duplicatesSkipped = 0;
    const errors: string[] = [];

    for (const item of dto.stamps) {
      try {
        const existing = await this.prisma.userStamp.findUnique({
          where: { client_uuid: item.client_uuid },
        });

        if (existing) {
          duplicatesSkipped++;
          continue;
        }

        await this.prisma.userStamp.create({
          data: {
            user_id: userId,
            stamp_id: BigInt(item.stamp_id),
            anchor_point_id: BigInt(item.anchor_point_id),
            client_uuid: item.client_uuid,
            scanned_at: new Date(item.scanned_at),
            synced_at: new Date(),
            latitude: item.latitude ? Number(item.latitude) : null,
            longitude: item.longitude ? Number(item.longitude) : null,
          },
        });

        syncedCount++;
      } catch (err: any) {
        errors.push(`Erro no client_uuid ${item.client_uuid}: ${err.message}`);
      }
    }

    return {
      message: 'Sincronização processada com sucesso!',
      syncedCount,
      duplicatesSkipped,
      errors,
    };
  }

  async getUserStamps(userId: number) {
    const userStamps = await this.prisma.userStamp.findMany({
      where: { user_id: userId },
      include: {
        stamp: true,
        anchor_point: true,
      },
      orderBy: { scanned_at: 'desc' },
    });

    return this.serializeBigInt(userStamps);
  }

  async toggleActive(id: number) {
    const stamp = await this.prisma.stamp.findUnique({
      where: { id: BigInt(id) },
    });

    if (!stamp) {
      throw new NotFoundException(`Carimbo ID ${id} não encontrado.`);
    }

    const updated = await this.prisma.stamp.update({
      where: { id: BigInt(id) },
      data: { active: !stamp.active },
    });

    return this.serializeBigInt(updated);
  }

  async deleteStamp(id: number) {
    const stamp = await this.prisma.stamp.findUnique({
      where: { id: BigInt(id) },
    });

    if (!stamp) {
      throw new NotFoundException(`Carimbo ID ${id} não encontrado.`);
    }

    await this.prisma.stamp.delete({
      where: { id: BigInt(id) },
    });

    return { message: `Carimbo ID ${id} removido com sucesso.` };
  }
}
