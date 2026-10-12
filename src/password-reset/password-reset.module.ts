import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/infra/orm/prisma/prisma.module';
import { makeMailer, MAILER } from './mailer';
import {
  AdminPasswordController,
  PasswordResetController,
} from './password-reset.controller';
import { PasswordResetService } from './password-reset.service';
import {
  PASSWORD_RESET_STORE,
  PrismaPasswordResetStore,
} from './password-reset.store';

@Module({
  imports: [PrismaModule],
  controllers: [PasswordResetController, AdminPasswordController],
  providers: [
    { provide: PASSWORD_RESET_STORE, useClass: PrismaPasswordResetStore },
    { provide: MAILER, useFactory: () => makeMailer() },
    {
      provide: PasswordResetService,
      inject: [PASSWORD_RESET_STORE, MAILER],
      useFactory: (store, mailer) => new PasswordResetService(store, mailer),
    },
  ],
})
export class PasswordResetModule {}
