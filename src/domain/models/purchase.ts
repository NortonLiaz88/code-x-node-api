import { StoreItem } from './store-item';
import { UserModel } from './user';

export class Purchase {
  id: number;
  userId: number;
  itemId: number;
  purchasedAt: Date;
}
