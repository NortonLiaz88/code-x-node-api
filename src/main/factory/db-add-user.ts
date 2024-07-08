import { JwtService } from '@nestjs/jwt';
import { DbAddUser } from 'src/data/usecases/user/add-user/db-add-user';
import { EncrypterAdapter } from 'src/infra/cryptography/encrypter';
import { TokenGeneratorAdapter } from 'src/infra/cryptography/token-generator';
import { PrismaClientService } from 'src/infra/orm/prisma/prisma-client.service';
import { UserPostgresRepository } from 'src/infra/postgresql/user.repository';

export const makeDbAddUser = (): DbAddUser => {
  const userPostgresRepository = new UserPostgresRepository(
    new PrismaClientService(),
  );

  const encrypter = new EncrypterAdapter(10);

  return new DbAddUser(
    encrypter,
    userPostgresRepository,
    userPostgresRepository,
    userPostgresRepository,
  );
};
