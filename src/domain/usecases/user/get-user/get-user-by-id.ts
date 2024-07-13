import { GetUserModel, UserModel } from "src/domain/models/user";

export interface GetUserById {
  getById(id: number): Promise<GetUserModel>;
}
