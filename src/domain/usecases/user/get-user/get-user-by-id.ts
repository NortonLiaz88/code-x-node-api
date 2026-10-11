import { GetUserModel } from 'src/domain/models/user';

export interface GetUserById {
  getById(id: number): Promise<GetUserModel>;
}
