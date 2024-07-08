import { Inject, Injectable } from '@nestjs/common';
import { DbAddUser } from 'src/data/usecases/db-add-user-repository';
import { AddUserDto } from 'src/main/dto/user/add-user/add-user.dto';


@Injectable()
export class UserService {
  constructor(
    @Inject() private readonly dbAddUser: DbAddUser,
  ) {}

  async addUser(createUserDto: AddUserDto) {
    return await this.dbAddUser.add(createUserDto)
  }

//   async getAll() {
//     return await this.dbGetAllUsers.getAll();
//   }

//   async findOne(filterOneUser: UserFindOneFilter) {
//     return this.dbFindOneUser.findOne(filterOneUser);
//   }

//   async findMany(filterManyUsers?: UserFindManyFilter) {
//     return this.dbFindManyUsers.findMany(filterManyUsers);
//   }
}
