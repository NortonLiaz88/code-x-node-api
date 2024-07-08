import { DbGetUserById } from 'src/data/usecases/user/get-user-by-id/db-get-user-by-id';
import { PrismaClientService } from 'src/infra/orm/prisma/prisma-client.service';
import { UserPostgresRepository } from 'src/infra/postgresql/user.repository';

export const makeDbGetUserById = (): DbGetUserById => {
  const userPostgresRepository = new UserPostgresRepository(
    new PrismaClientService(),
  );
  return new DbGetUserById(userPostgresRepository);
};
