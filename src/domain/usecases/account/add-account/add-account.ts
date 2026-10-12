import { AddUserModel } from '../../user/add-user/add-user';

export type AddAccountModel = AddUserModel;

export interface AddAccount {
  add: (account: AddAccountModel) => Promise<void>;
}
