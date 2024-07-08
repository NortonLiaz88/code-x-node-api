import { AddUserModel } from 'src/domain/usecases/user/add-user';
import { User } from 'src/domain/models/user';
import { AddUserRepository } from 'src/data/protocols/db/user/add-user-repository';
import { GetAccountByUsernameRepository } from 'src/data/protocols/db/authentication/db-get-account-by-username';
import { GetAccountByEmailRepository } from 'src/data/protocols/db/authentication/db-get-account-by-email';
import { PrismaClientService } from '../orm/prisma/prisma-client.service';

export class UserPostgresRepository
  implements
    AddUserRepository,
    GetAccountByEmailRepository,
    GetAccountByUsernameRepository
{
  constructor(private readonly ormService: PrismaClientService) {}

  async add(user: AddUserModel): Promise<User> {
    const newUser = await this.ormService.user.create({
      data: {
        email: user.email,
        name: user.name,
        lastName: user.lastName,
        password: user.password,
        phoneNumber: user.phoneNumber,
        username: user.username,
        profile: {
          create: {
            knowledge: user.profile.knowledge,
            activeProgrammingLanguage: user.profile.programmingLanguage,
            interests: user.profile.interests,
            destination: user.profile.destination,
            ...(user.profile.anotherInterest && {
              anotherInterest: user.profile.anotherInterest,
            }),
            ...(user.profile.anotherDestination && {
              anotherDestination: user.profile.anotherDestination,
            }),
          },
        },
      },
    });

    return newUser;
  }

  async getByEmail(email: string): Promise<User | null> {
    const user = await this.ormService.user.findFirst({
      where: {
        email: email,
      },
    });

    return user;
  }

  async getByUsername(username: string): Promise<User | null> {
    const user = await this.ormService.user.findFirst({
      where: {
        username: username,
      },
    });
    return user;
  }
}
