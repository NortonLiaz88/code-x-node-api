import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { Encrypter } from 'src/data/protocols/cryptography/encrypter';
import { DbAddUser } from 'src/data/usecases/user/add-user/db-add-user';
import { DbDeleteUser } from 'src/data/usecases/user/delete-user/delete-user';
import { DbExistUser } from 'src/data/usecases/user/exist-user/exist-user';
import { DbGetPaginatedUsers } from 'src/data/usecases/user/get-all-users/db-get-paginated-profiles';
import { DbGetUserById } from 'src/data/usecases/user/get-user-by-id/db-get-user-by-id';
import { DbUpdateUser } from 'src/data/usecases/user/update-user/update-user';
import {
  PageableDto,
  PaginatedResultDTO,
} from 'src/main/dto/commons/pageable.dto';
import { AddUserDto } from 'src/main/dto/user/add-user/add-user.dto';
import { UserStrictResponseDto } from 'src/main/dto/user/get-paginated-users/get-users-with-pagination.dto';
import { OrderedUserDTO } from 'src/main/dto/user/get-paginated-users/ordered-user.dto';
import { UserResponseDto } from 'src/main/dto/user/get-user/get-user.dto';
import { UserUpdateDto } from 'src/main/dto/user/update-user/update-user.dto';

@Injectable()
export class UserService {
  constructor(
    @Inject() private readonly dbGetPaginatedUsers: DbGetPaginatedUsers,
    @Inject() private readonly dbGetUserById: DbGetUserById,
    @Inject() private readonly dbCreateUser: DbAddUser,
    @Inject() private readonly dbUpdateUser: DbUpdateUser,
    @Inject() private readonly dbDeleteUser: DbDeleteUser,
    @Inject() private readonly dbExistUser: DbExistUser,
    @Inject() private readonly encrypter: Encrypter,
  ) {}

  async getAllWithPagination(
    pagination: PageableDto,
    ordering: OrderedUserDTO,
    search?: string,
  ): Promise<PaginatedResultDTO<UserStrictResponseDto>> {
    const result = await this.dbGetPaginatedUsers.getAllWithPagination(
      pagination,
      ordering,
      search,
    );

    return result;
  }

  async getById(id: number): Promise<UserResponseDto> {
    const user = await this.dbGetUserById.getById(id);

    if (!user) {
      throw new NotFoundException('User Not Found');
    }

    return user;
  }

  async createUser(
    userData: AddUserDto,
  ): Promise<UserResponseDto> {

    const existEmail = await this.dbExistUser.existUserWithEmail(
      userData.email,
    );

    if (existEmail) {
      throw new ConflictException('E-mail already registered');
    }

    const existUsername = await this.dbExistUser.existUserWithUsername(
      userData.username,
    );

    if (existUsername) {
      throw new ConflictException('Username already registered');
    }

    const existPhoneNumber = await this.dbExistUser.existUserWithPhoneNumber(
      userData.phoneNumber,
    );

    if (existPhoneNumber) {
      throw new ConflictException('Phone number already registered');
    }

    const user = {...userData};

    user.password = await this.encrypter.encrypt(user.password);

    console.log('USER PASSWORD', user.password);

    const result = await this.dbCreateUser.add(user);

    return result;
  }

  async updateUser(
    id: number,
    userData: UserUpdateDto,
  ): Promise<UserResponseDto> {
    const currentUser = await this.dbGetUserById.getById(id);

    if (!currentUser) {
      throw new NotFoundException('User Not Found');
    }

    if (currentUser.email != userData.email) {
      const existEmail = await this.dbExistUser.existUserWithEmail(
        userData.email,
      );

      if (existEmail) {
        throw new ConflictException('E-mail already registered');
      }
    }

    if (currentUser.username != userData.username) {
      const existUsername = await this.dbExistUser.existUserWithUsername(
        userData.username,
      );

      if (existUsername) {
        throw new ConflictException('Username already registered');
      }
    }


    if (currentUser.phoneNumber != userData.phoneNumber) {
      const existPhoneNumber = await this.dbExistUser.existUserWithPhoneNumber(
        userData.phoneNumber,
      );

      if (existPhoneNumber) {
        throw new ConflictException('Phone number already registered');
      }
    }

    const updatedUser = { ...currentUser, ...userData };

    if (userData.password) {
      updatedUser.password = await this.encrypter.encrypt(userData.password);
    }

    delete updatedUser.id;
    const result = await this.dbUpdateUser.update(id, updatedUser);

    return result;
  }

  async deleteUser(id: number) {
    console.log('ID', id);
    const user = await this.dbGetUserById.getById(id);

    if (!user) {
      throw new NotFoundException('User Not Found');
    }

    const isRemovableUser = await this.dbDeleteUser.isRemovableUser(id);

    if (!isRemovableUser) {
      throw new UnprocessableEntityException('User is not removable');
    }

    const result = await this.dbDeleteUser.deleteUser(id);
    return result;
  }
}
