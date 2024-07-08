import * as bcrypt from 'bcrypt';
import { HashComparer } from '../../data/protocols/cryptography/hash-comparer';

export class HashComparerAdapter implements HashComparer {
  async compare(value: string, hash: string): Promise<boolean> {
    const isValid = await bcrypt.compare(value, hash);
    return isValid;
  }
}
