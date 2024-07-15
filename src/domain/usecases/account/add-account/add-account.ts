import { UserCreationProfile } from "../../user/add-user/add-user";

export interface AddAccountModel {
  name: string;
  lastName: string;
  password: string;
  username: string;
  phoneNumber: string;
  email: string;
  profile: UserCreationProfile;
  schedule: any;
}

export interface AddAccount {
  add: (account: AddAccountModel) => Promise<void>;
}
