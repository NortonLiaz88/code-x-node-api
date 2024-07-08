import { UserModel } from "src/domain/models/user";

export interface GetUserById {
  getById(id: number): Promise<UserModel>;
}
