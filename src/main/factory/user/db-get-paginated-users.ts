import { DbGetPaginatedUsers } from 'src/data/usecases/user/get-all-users/db-get-paginated-profiles';
import { PrismaClientService } from 'src/infra/orm/prisma/prisma-client.service';
import { UserPostgresRepository } from 'src/infra/postgresql/user.repository';

export const makeDbGetPaginatedUsers = (): DbGetPaginatedUsers => {
  const userPostgresRepository = new UserPostgresRepository(
    new PrismaClientService(),
  );
  return new DbGetPaginatedUsers(userPostgresRepository);
};
