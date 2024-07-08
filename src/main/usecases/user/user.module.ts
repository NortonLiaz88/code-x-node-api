import { Module } from '@nestjs/common';
import { EncrypterAdapter } from 'src/infra/cryptography/encrypter';
import { PrismaModule } from 'src/infra/orm/prisma/prisma.module';
import { makeDbAddUser } from 'src/main/factory/db-add-user';
import { makeDbDeleteUser } from 'src/main/factory/user/db-delete-user.factory';
import { makeDbExistUser } from 'src/main/factory/user/db-exist-user.factory';
import { makeDbGetPaginatedUsers } from 'src/main/factory/user/db-get-paginated-users';
import { makeDbGetUserById } from 'src/main/factory/user/db-get-user-by-id';
import { makeDbUpdateUser } from 'src/main/factory/user/db-update-user.factory';
import { CreateUserController } from 'src/presentation/controllers/user/create-user-controller';
import { DeleteUserController } from 'src/presentation/controllers/user/delete-user/delete-user.controller';
import { GetUsersContoller } from 'src/presentation/controllers/user/get-users/get-user.controller';
import { UpdateUserController } from 'src/presentation/controllers/user/update-user/update-user.controller';
import { UserService } from 'src/service/user/user.service';

@Module({
  imports: [PrismaModule],
  providers: [
    {
      provide: UserService,
      useFactory: () => {
        const dbAddUser = makeDbAddUser();
        const dbGetPaginatedUsers = makeDbGetPaginatedUsers();
        const dbGetUserById = makeDbGetUserById();
        const dbUpdateUser = makeDbUpdateUser();
        const dbDeleteUser = makeDbDeleteUser();
        const dbExistUser = makeDbExistUser();
        const encrypter = new EncrypterAdapter(10);

        return new UserService(
          dbGetPaginatedUsers,
          dbGetUserById,
          dbAddUser,
          dbUpdateUser,
          dbDeleteUser,
          dbExistUser,
          encrypter,
        );
      },
    },
  ],
  controllers: [CreateUserController, GetUsersContoller, UpdateUserController, DeleteUserController],
})
export class UserModule {}
