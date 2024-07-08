import { AddUserModel } from 'src/domain/usecases/user/add-user';
import { PrismaClientService } from '../orm/prisma/prisma-client.service';
import { User } from 'src/domain/models/user';
import { AddUserRepository } from 'src/data/protocols/db/user/add-user-repository';

export class UserPostgresRepository implements AddUserRepository {
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
}
