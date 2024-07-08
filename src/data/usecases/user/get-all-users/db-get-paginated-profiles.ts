import { GetPaginatedUsersRepository } from 'src/data/protocols/db/user/db-get-paginated-users-repository';
import {
  PaginatedResult,
  PaginationInfo,
} from 'src/domain/commons/base/pagination.base';
import { UserModel } from 'src/domain/models/user';
import {
  GetPaginatedUsers,
  OrderedUser,
} from 'src/domain/usecases/user/get-all-users/get-paginated-users';

export class DbGetPaginatedUsers implements GetPaginatedUsers {
  constructor(
    private readonly getPaginatedUsersRepository: GetPaginatedUsersRepository,
  ) {}

  getAllWithPagination(
    pagination: PaginationInfo,
    ordering: OrderedUser,
    search?: string,
  ): Promise<PaginatedResult<UserModel>> {
    return this.getPaginatedUsersRepository.getPaginatedUsers(
      pagination,
      ordering,
      search,
    );
  }
}
