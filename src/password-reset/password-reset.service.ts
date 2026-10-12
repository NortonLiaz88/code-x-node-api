import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { createHash, randomBytes } from 'crypto';
import * as bcrypt from 'bcrypt';
import { MAILER, Mailer } from './mailer';
import { resetConfig } from './password-reset.config';
import {
  PASSWORD_RESET_STORE,
  PasswordResetStore,
} from './password-reset.store';

export const INVALID_RESET_LINK =
  'Este link de redefinição é inválido ou expirou. Peça um novo.';

export const hashToken = (token: string) =>
  createHash('sha256').update(token).digest('hex');

const resetEmail = (link: string, ttlMinutes: number) =>
  [
    'Olá!',
    '',
    'Recebemos um pedido para redefinir a sua senha no CodeX.',
    `Abra este link no celular em que o app está instalado: ${link}`,
    '',
    `O link vale por ${ttlMinutes} minutos e só pode ser usado uma vez.`,
    'Se não foi você que pediu, ignore este email. Sua senha continua a mesma.',
  ].join('\n');

@Injectable()
export class PasswordResetService {
  private readonly logger = new Logger(PasswordResetService.name);

  constructor(
    @Inject(PASSWORD_RESET_STORE) private readonly store: PasswordResetStore,
    @Inject(MAILER) private readonly mailer: Mailer,
    private readonly now: () => Date = () => new Date(),
    private readonly config = resetConfig(),
  ) {}

  // Same outcome whether or not the email belongs to someone.
  async requestReset(email: string): Promise<void> {
    const user = await this.store.findUserByEmail(email.trim());
    if (!user) return;

    const token = randomBytes(32).toString('base64url');
    const expiresAt = new Date(
      this.now().getTime() + this.config.ttlMinutes * 60_000,
    );
    await this.store.replaceToken(user.id, hashToken(token), expiresAt);

    const link = `${this.config.linkBase}?token=${token}`;
    try {
      await this.mailer.send({
        to: user.email,
        subject: 'Redefinir sua senha no CodeX',
        text: resetEmail(link, this.config.ttlMinutes),
      });
    } catch (err) {
      // Answering differently would tell who has an account.
      this.logger.error(`Reset email to user ${user.id} failed: ${err}`);
    }
  }

  async resetPassword(token: string, password: string): Promise<void> {
    const now = this.now();
    const reset = await this.store.findToken(hashToken(token));
    if (!reset || reset.usedAt || reset.expiresAt <= now) {
      throw new BadRequestException(INVALID_RESET_LINK);
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const done = await this.store.consumeAndSetPassword(
      reset.id,
      passwordHash,
      now,
    );
    if (!done) throw new BadRequestException(INVALID_RESET_LINK);
  }

  // Admin fallback when the student can't reach their email.
  async adminSetPassword(userId: number, password: string): Promise<void> {
    if (!(await this.store.userExists(userId))) {
      throw new NotFoundException('User Not Found');
    }
    await this.store.setPassword(userId, await bcrypt.hash(password, 10));
  }
}
