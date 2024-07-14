import { JwtService } from '@nestjs/jwt';
import { DbRefreshToken } from '../../../data/usecases/authentication/db-refresh-token';
import { TokenDecoderAdapter } from 'src/infra/cryptography/token-decoder';
import { TokenGeneratorAdapter } from 'src/infra/cryptography/token-generator';
import { TokenInspectorAdapter } from 'src/infra/cryptography/token-inspector';
import { PrismaClientService } from 'src/infra/orm/prisma/prisma-client.service';
import { UserPostgresRepository } from 'src/infra/postgresql/user.repository';

export const makeDbRefreshToken = (): DbRefreshToken => {
  const accountPostgresRepository = new UserPostgresRepository(
    new PrismaClientService(),
  );

  const jwtService = new JwtService();

  const tokenGenerator = new TokenGeneratorAdapter(jwtService);
  const tokenDecoder = new TokenDecoderAdapter(jwtService);
  const tokenInspector = new TokenInspectorAdapter(jwtService);

  return new DbRefreshToken(
    tokenDecoder,
    tokenInspector,
    tokenGenerator,
    accountPostgresRepository,
  );
};
