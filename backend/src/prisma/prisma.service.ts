// import { Injectable, OnModuleInit } from '@nestjs/common';
// import { PrismaClient } from '@prisma/client';

// @Injectable()
// export class PrismaService extends PrismaClient implements OnModuleInit {
//   async onModuleInit() {
//     await this.$connect();
//   }
// }

import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { PrismaClient } from '@prisma/client';
import 'dotenv/config';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    const target = process.env.DB_TARGET || 'local';
    let rawUrl = process.env.DATABASE_URL;

    if (target === 'production') {
      if (process.env.PROD_DATABASE_URL && process.env.PROD_DATABASE_URL.trim()) {
        rawUrl = process.env.PROD_DATABASE_URL.trim();
      } else {
        throw new Error(
          '[PrismaService] DB_TARGET=production foi definido, porém PROD_DATABASE_URL não está configurada no .env!',
        );
      }
    }

    if (!rawUrl) {
      throw new Error(`DATABASE_URL environment variable is not defined for DB_TARGET=${target}`);
    }

    console.log(`[PrismaService] Connecting to database target: ${target.toUpperCase()}`);

    let dbUrl = rawUrl.replace('mysql://', 'mariadb://');
    if (!dbUrl.includes('allowPublicKeyRetrieval')) {
      dbUrl += dbUrl.includes('?') ? '&allowPublicKeyRetrieval=true' : '?allowPublicKeyRetrieval=true';
    }
    const adapter = new PrismaMariaDb(dbUrl);
    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect();
  }
}
