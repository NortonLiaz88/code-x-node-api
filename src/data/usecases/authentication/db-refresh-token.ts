import { GetAccountByEmailRepository } from '../../protocols/db/authentication/db-get-account-by-email';
import { TokenGenerator } from '../../../data/protocols/cryptography/token-generator';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { AuthToken } from 'src/domain/models/auth-token';
import { RefreshToken } from 'src/domain/usecases/authentication/refresh-token';
import { TokenDecoder } from '../../../data/protocols/cryptography/token-decoder';
import { TokenInspector } from '../../../data/protocols/cryptography/token-inspector';

export class DbRefreshToken implements RefreshToken {
  constructor(
    private readonly tokenDecoder: TokenDecoder,
    private readonly tokenInspector: TokenInspector,
    private readonly tokenGenerator: TokenGenerator,

    private readonly loadAccountByEmailRepository: GetAccountByEmailRepository,
  ) {}

  async refresh(refreshToken: string): Promise<AuthToken | null> {
    const validToken = await this.tokenInspector.verify(refreshToken);

    if (!validToken) {
      throw new UnauthorizedException('Assinatura Inválida');
    }

    const { email } = (await this.tokenDecoder.decode(refreshToken)).payload;

    if (!email) {
      throw new NotFoundException('Usuário não encontrado');
    }

    const account = await this.loadAccountByEmailRepository.getByEmail(email);

    if (account) {
      const { name, lastName, email } = account;

      const accessToken = await this.tokenGenerator.generate({
        name,
        lastName,
        email,
      });
      return accessToken;
    }

    throw new NotFoundException('Usuário não encontrado');
  }
}
