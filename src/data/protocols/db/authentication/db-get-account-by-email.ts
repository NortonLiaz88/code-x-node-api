import { GetUserModel } from "src/domain/models/user";

export interface GetAccountByEmailRepository {
  getByEmail: (email: string) => Promise<GetUserModel | null>;
}
