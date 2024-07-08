import { StoreItem } from './store-item';
import { User } from './user';

export class Purchase {
  id: number;
  user: User;
  userId: number;
  item: StoreItem;
  itemId: number;
  purchasedAt: Date;
}
