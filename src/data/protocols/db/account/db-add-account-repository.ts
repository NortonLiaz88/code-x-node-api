import { AddAccountModel } from 'src/domain/usecases/account/add-account/add-account';

export interface AddAccountRepository {
  add(account: AddAccountModel): Promise<void>;
}
