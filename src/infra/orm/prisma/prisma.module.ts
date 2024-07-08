import { Module } from '@nestjs/common';
import { PrismaClientService } from './prisma-client.service';

@Module({
  imports: [],
  providers: [PrismaClientService],
  exports: [PrismaClientService],
})
export class PrismaModule {}
