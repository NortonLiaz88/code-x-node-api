import {
  PaginatedResult,
  PaginationInfo,
} from 'src/domain/commons/base/pagination.base';
import { GetUserModel } from 'src/domain/models/user';
import { OrderedUser } from 'src/domain/usecases/user/get-all-users/get-paginated-users';

export interface GetPaginatedUsersRepository {
  getPaginatedUsers(
    pagination: PaginationInfo,
    ordering: OrderedUser,
    search?: string,
  ): Promise<PaginatedResult<GetUserModel>>;
}
