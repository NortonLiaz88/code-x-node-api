import { UserModel } from "src/domain/models/user";


export type UpdateUserModel = {
  email?: string;
  password?: string;
  username?: string;
  name?: string;
  lastName?: string;
  phoneNumber?: string;
  diamonds?: number;
  experience?: number;
};

export interface UpdateUser {
  update(id: number, request: Partial<UpdateUserModel>): Promise<UserModel>;

  isEditableUser(id: number): Promise<boolean>;
}
