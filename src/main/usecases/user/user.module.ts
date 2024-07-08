import { Module } from "@nestjs/common";
import { PrismaModule } from "src/infra/orm/prisma/prisma.module";
import { makeDbAddUser } from "src/main/factory/db-add-user";
import { CreateUserController } from "src/presentation/controllers/user/create-user-controller";
import { UserService } from "src/service/user/user.service";

@Module({
    imports: [PrismaModule],
    providers: [
        {
            provide: UserService,
            useFactory: () => {
                const dbAddUser = makeDbAddUser();
                return new UserService(dbAddUser)
            }
        }
    ],
    controllers: [CreateUserController]
})
export class UserModule {}