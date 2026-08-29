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

    if (target === 'production' && process.env.PROD_DATABASE_URL) {
      rawUrl = process.env.PROD_DATABASE_URL;
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
