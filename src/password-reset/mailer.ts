import { Logger } from '@nestjs/common';
import { createTransport, Transporter } from 'nodemailer';

export type Mail = { to: string; subject: string; text: string };

export interface Mailer {
  send(mail: Mail): Promise<void>;
}

export const MAILER = Symbol('MAILER');

// Local development: the email goes to the API log.
export class ConsoleMailer implements Mailer {
  private readonly logger = new Logger('Mail');

  async send(mail: Mail): Promise<void> {
    this.logger.log(`To ${mail.to}: ${mail.subject}\n${mail.text}`);
  }
}

export class SmtpMailer implements Mailer {
  private readonly transport: Transporter;

  constructor(
    url: string,
    private readonly from: string,
  ) {
    this.transport = createTransport(url);
  }

  async send(mail: Mail): Promise<void> {
    await this.transport.sendMail({ from: this.from, ...mail });
  }
}

// SMTP_URL picks SMTP (Mailpit in compose); without it, mail is logged.
export const makeMailer = (env = process.env): Mailer =>
  env.SMTP_URL
    ? new SmtpMailer(
        env.SMTP_URL,
        env.MAIL_FROM || 'CodeX <no-reply@codex.local>',
      )
    : new ConsoleMailer();
