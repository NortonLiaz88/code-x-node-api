import { Module } from '@nestjs/common';
import { PurchasesService } from './purchases.service';
import { PurchasesController } from './purchases.controller';
import { PrismaModule } from 'src/infra/orm/prisma/prisma.module';

@Module({
  controllers: [PurchasesController],
  providers: [PurchasesService],
  imports: [PrismaModule],
})
export class PurchasesModule {}
