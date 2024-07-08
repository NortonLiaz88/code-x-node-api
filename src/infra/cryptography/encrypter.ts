import * as bcrypt from 'bcrypt';
import { Encrypter } from '../../data/protocols/cryptography/encrypter';

export class EncrypterAdapter implements Encrypter {
  constructor(private readonly salt: number) {}

  async encrypt(value: string): Promise<string> {
    const hash = await bcrypt.hash(value, this.salt);
    return await new Promise<string>((resolve) => resolve(hash));
  }
}
