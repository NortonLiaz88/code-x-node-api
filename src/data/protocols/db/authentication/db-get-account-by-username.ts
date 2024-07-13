import { GetUserModel } from "src/domain/models/user";

export interface GetAccountByUsernameRepository {
  getByUsername: (username: string) => Promise<GetUserModel | null>;
}
