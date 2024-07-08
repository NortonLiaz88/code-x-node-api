import {
  PaginatedResult,
  PaginationInfo,
} from 'src/domain/commons/base/pagination.base';
import { UserModel } from 'src/domain/models/user';

export enum OrderByUser {
  Name = 'name',
  Email = 'email',
  Registration = 'registration',
  Profile = 'profile',
  CreatedAt = 'createdAt',
}

export enum OrderUser {
  Asc = 'asc',
  Desc = 'desc',
}

export type OrderedUser = {
  orderBy: OrderByUser;
  order: OrderUser;
};

export interface GetPaginatedUsers {
  getAllWithPagination(
    pagination: PaginationInfo,
    ordering: OrderedUser,
    search?: string,
  ): Promise<PaginatedResult<UserModel>>;
}
