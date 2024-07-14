import { GetUserModel, UserModel } from 'src/domain/models/user';
import { AddUserRepository } from 'src/data/protocols/db/user/db-add-user-repository';
import { GetAccountByUsernameRepository } from 'src/data/protocols/db/authentication/db-get-account-by-username';
import { GetAccountByEmailRepository } from 'src/data/protocols/db/authentication/db-get-account-by-email';
import { PrismaClientService } from '../orm/prisma/prisma-client.service';
import { AddUserModel } from 'src/domain/usecases/user/add-user/add-user';
import { DeleteUserRepository } from 'src/data/protocols/db/user/db-delete-user-repository';
import { ExistUserRepository } from 'src/data/protocols/db/user/db-exist-user-repository';
import { UpdateUserRepository } from 'src/data/protocols/db/user/db-update-user-repository';
import { GetPaginatedUsersRepository } from 'src/data/protocols/db/user/db-get-paginated-users-repository';
import { GetUserByIdRepository } from 'src/data/protocols/db/user/db-get-user-by-id-repository';
import {
  PaginationInfo,
  PaginatedResult,
} from 'src/domain/commons/base/pagination.base';
import { OrderedUser } from 'src/domain/usecases/user/get-all-users/get-paginated-users';
import { UpdateUserModel } from 'src/domain/usecases/user/update-user/update-user';

export class UserPostgresRepository
  implements
    AddUserRepository,
    GetAccountByEmailRepository,
    GetAccountByUsernameRepository,
    GetPaginatedUsersRepository,
    GetUserByIdRepository,
    UpdateUserRepository,
    DeleteUserRepository,
    ExistUserRepository
{
  constructor(private readonly ormService: PrismaClientService) {}

  async getPaginatedUsers(
    pagination: PaginationInfo,
    ordering: OrderedUser,
    search?: string,
  ): Promise<PaginatedResult<UserModel>> {
    const total = await this.ormService.user.count();

    const lastPage = Math.ceil(total / pagination.take);
    const skip = +pagination.take * (+pagination.page - 1);

    const record = await this.ormService.user.findMany({
      orderBy: [
        {
          [ordering.orderBy]: ordering.order,
        },
      ],
      include: {
        profile: true,
        purchases: true,
        schedule: true,
        userCourse: true,
        userPreference: true,
      },
      where: {
        OR: [
          {
            OR: [
              {
                name: {
                  contains: search?.toString() ?? '',
                },
              },
              {},
            ],
          },
        ],
      },
      distinct: 'id',
      take: +pagination.take,
      skip,
    });

    const meta = {
      total: total,
      lastPage: lastPage,
      currentPage: +pagination.page,
      perPage: +pagination.take,
    };

    const currenData: UserModel[] = record?.map((userData) => {
      const user = { ...userData };
      delete user.password;
      return user;
    });

    const result = {
      data: currenData,
      meta,
    };

    return result;
  }

  async getById(id: number): Promise<GetUserModel> {
    const user = await this.ormService.user.findFirst({
      where: {
        id: id,
      },
    });

    const userWithoutPassword = this.exclude(user, ['password'])
    return userWithoutPassword;
  }

  async updateUser(
    id: number,
    user: Partial<UpdateUserModel>,
  ): Promise<GetUserModel> {
    const updatedUser = await this.ormService.user.update({
      where: {
        id: id,
      },
      data: {
        ...user,
      },
    });

    const userWithoutPassword = this.exclude(updatedUser, ['password'])
    return userWithoutPassword;
  }

  async add(user: AddUserModel): Promise<GetUserModel> {
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

    const userWithoutPassword = this.exclude(newUser, ['password'])
    return userWithoutPassword;
  }

  async getByEmail(email: string): Promise<GetUserModel | null> {
    const user = await this.ormService.user.findUnique({
      where: {
        email: email,
      },
    });
   
    return user;
  }

  async getByUsername(username: string): Promise<GetUserModel | null> {
    const user = await this.ormService.user.findFirst({
      where: {
        username: username,
      },
    });

    return user ? this.exclude(user, ['password']) : null;
  }

  async existUserWithUsername(username: string): Promise<boolean> {
    const userCount = await this.ormService.user.count({
      where: { username: { equals: username, mode: 'insensitive' } },
    });
    return userCount > 0;
  }

  async existUserWithEmail(email: string): Promise<boolean> {
    const userCount = await this.ormService.user.count({
      where: { email: { equals: email, mode: 'insensitive' } },
    });
    return userCount > 0;
  }

  async existUserWithPhoneNumber(phoneNumber: string): Promise<boolean> {
    const userCount = await this.ormService.user.count({
      where: { phoneNumber },
    });
    return userCount > 0;
  }

  async deleteUser(id: number): Promise<void> {
    await this.ormService.user.delete({ where: { id } });
  }

  async isEditableUser(id: number): Promise<boolean> {
    const result = await this.ormService.user.findFirst({ where: { id } });
    return result.experience > 0 || result.diamonds > 0;
  }

  async isRemovableUser(id: number): Promise<boolean> {
    const result = await this.ormService.user.findFirst({ where: { id } });
    return result.experience > 0 || result.diamonds > 0;
  }

  exclude<User, Key extends keyof User>(
    user: User,
    keys: Key[],
  ): Omit<User, Key> {
    return Object.fromEntries(
      Object.entries(user).filter(([key]) => !keys.includes(key as Key)),
    ) as Omit<User, Key>;
  }
}
