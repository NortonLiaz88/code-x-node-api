import { Module } from '@nestjs/common';
import { AuthController } from '../../../presentation/controllers/auth/auth.controller';
import { AuthService } from './auth.service';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt/jwtStrategy';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './auth.guard';
import { TokenDecoderAdapter } from 'src/infra/cryptography/token-decoder';
import { UserModule } from '../user/user.module';
import { makeDbAuthentication } from 'src/main/factory/auth/db-auth';
import { makeDbRefreshToken } from 'src/main/factory/auth/db-refresh-token';
import { makeDbAddUser } from 'src/main/factory/db-add-user';

@Module({
  imports: [
    UserModule,
    PassportModule,
    JwtModule.register({
      global: true,
      secret: `${process.env.JWT_SECRET_KEY}`,
      signOptions: { expiresIn: '1h' },
    }),
  ],
  controllers: [AuthController],
  providers: [
    {
      provide: AuthService,
      useFactory: () => {
        const dbAuthentication = makeDbAuthentication();
        const dbAddAccount = makeDbAddUser();
        const dbRefreshToken = makeDbRefreshToken();
        const jwtService = new JwtService();
        const tokenDecoder = new TokenDecoderAdapter(jwtService);

        return new AuthService(
          dbAuthentication,
          dbAddAccount,
          dbRefreshToken,
          tokenDecoder,
        );
      },
    },
    JwtStrategy,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
  exports: [AuthService],
})
export class AuthModule {}
