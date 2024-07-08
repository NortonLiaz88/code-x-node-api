import { DbUpdateUser } from 'src/data/usecases/user/update-user/update-user';
import { PrismaClientService } from 'src/infra/orm/prisma/prisma-client.service';
import { UserPostgresRepository } from 'src/infra/postgresql/user.repository';

export const makeDbUpdateUser = (): DbUpdateUser => {
  const updateUserPostgresRepository = new UserPostgresRepository(
    new PrismaClientService(),
  );

  return new DbUpdateUser(updateUserPostgresRepository);
};
