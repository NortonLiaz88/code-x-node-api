import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaClientService extends PrismaClient implements OnModuleInit {
  constructor() {
    super({
      // SQL queries are logged only when PRISMA_LOG_QUERIES=true (noisy).
      log: [
        ...(process.env.PRISMA_LOG_QUERIES === 'true'
          ? [{ emit: 'stdout' as const, level: 'query' as const }]
          : []),
        {
          emit: 'stdout',
          level: 'error',
        },
        {
          emit: 'stdout',
          level: 'info',
        },
        {
          emit: 'stdout',
          level: 'warn',
        },
      ],
    });
  }
  async onModuleInit() {
    await this.$connect();
  }
}
