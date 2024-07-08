import { UserModel } from "src/domain/models/user";

export interface GetUserByIdRepository {
  getById(id: number): Promise<UserModel>;
}
