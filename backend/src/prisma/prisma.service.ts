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
import * as mariadb from 'mariadb';
import 'dotenv/config';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    const target = process.env.DB_TARGET || 'local';
    let rawUrl = process.env.DATABASE_URL;

    if (target === 'production' && process.env.PROD_DATABASE_URL && process.env.PROD_DATABASE_URL.trim()) {
      rawUrl = process.env.PROD_DATABASE_URL.trim();
    } else if (!rawUrl && process.env.PROD_DATABASE_URL) {
      rawUrl = process.env.PROD_DATABASE_URL.trim();
    }

    if (!rawUrl) {
      throw new Error(`[PrismaService] Nenhuma variável DATABASE_URL ou PROD_DATABASE_URL foi configurada!`);
    }

    console.log(`[PrismaService] Connecting to database target: ${target.toUpperCase()}`);

    const parsedUrl = new URL(rawUrl);
    const poolConfig: mariadb.PoolConfig = {
      host: parsedUrl.hostname || '127.0.0.1',
      port: parsedUrl.port ? parseInt(parsedUrl.port, 10) : 3306,
      user: decodeURIComponent(parsedUrl.username),
      password: decodeURIComponent(parsedUrl.password),
      database: parsedUrl.pathname.replace(/^\//, ''),
      allowPublicKeyRetrieval: true,
      connectTimeout: 10000,
    };

    const adapter = new PrismaMariaDb(poolConfig);
    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect();
  }
}
