import { applyDecorators } from '@nestjs/common';
import { IsStrongPassword } from 'class-validator';

// The rule login checks, so every password a user can set also logs in.
export const PASSWORD_RULES = {
  minLength: 6,
  minLowercase: 0,
  minUppercase: 0,
  minNumbers: 1,
  minSymbols: 0,
};

export const IsAppPassword = () =>
  applyDecorators(
    IsStrongPassword(PASSWORD_RULES, {
      message: 'password must have at least 6 characters and one number',
    }),
  );
