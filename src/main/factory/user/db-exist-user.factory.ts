import { DbExistUser } from 'src/data/usecases/user/exist-user/exist-user';
import { PrismaClientService } from 'src/infra/orm/prisma/prisma-client.service';
import { UserPostgresRepository } from 'src/infra/postgresql/user.repository';

export const makeDbExistUser = (): DbExistUser => {
  const existUserPostgresRepository = new UserPostgresRepository(
    new PrismaClientService(),
  );

  return new DbExistUser(existUserPostgresRepository);
};
