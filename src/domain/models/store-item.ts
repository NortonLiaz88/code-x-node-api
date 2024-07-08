import { ItemType } from '@prisma/client';
import { Purchase } from './purchase';

export class StoreItem {
  id: number;
  name: string;
  description?: string;
  price: number; // price in diamonds
  type: ItemType;
  requiredExp: number; // experience required to unlock the item
  purchases?: Purchase[];
}
