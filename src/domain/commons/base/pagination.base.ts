export interface IMetaPagination {
  total: number;
  lastPage: number;
  currentPage: number;
  perPage: number;
}

export interface PaginatedResult<T> {
  meta: IMetaPagination;
  data: T[];
}

export interface GetAllParams {
  page: number;
  take: number;
  queryName?: string;
}

export interface PaginationInfo {
  page: number;
  take: number;
}

export enum Order {
  Asc = 'asc',
  Desc = 'desc',
}

