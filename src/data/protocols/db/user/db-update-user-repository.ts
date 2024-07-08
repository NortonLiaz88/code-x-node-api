import { UserModel } from "src/domain/models/user";
import { UpdateUserModel } from "src/domain/usecases/user/update-user/update-user";

export interface UpdateUserRepository {
  updateUser(id: number, user: Partial<UpdateUserModel>): Promise<UserModel>;

  isEditableUser(id: number): Promise<boolean>;
}
