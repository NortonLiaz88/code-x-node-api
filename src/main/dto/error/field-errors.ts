import {
  BadRequestException,
  ConflictException,
  HttpException,
  ValidationError,
  ValidationPipe,
} from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';

// One problem with one request field, shown by the app next to that field.
export class FieldErrorDto {
  @ApiProperty({ example: 'email' })
  field: string;

  @ApiProperty({ example: 'Este email já está em uso.' })
  message: string;
}

export class FieldErrorsDto {
  @ApiProperty({ example: 409 })
  statusCode: number;

  @ApiProperty({ example: 'Conflict' })
  error: string;

  @ApiProperty({
    description: 'Summary; for 400s, the validator messages as before',
  })
  message: string | string[];

  @ApiProperty({ type: [FieldErrorDto] })
  fields: FieldErrorDto[];
}

// Portuguese text for common checks that have no custom message; others
// keep their own message.
const MESSAGES: Record<string, string> = {
  isEmail: 'Email inválido.',
  isNotEmpty: 'Campo obrigatório.',
  isDefined: 'Campo obrigatório.',
  isEnum: 'Escolha uma das opções.',
};

export const fieldErrorsFrom = (
  errors: ValidationError[],
  parent = '',
): FieldErrorDto[] =>
  errors.flatMap((error) => {
    const field = parent ? `${parent}.${error.property}` : error.property;
    const own = Object.entries(error.constraints ?? {}).map(
      ([constraint, message]) => ({
        field,
        message: MESSAGES[constraint] ?? message,
      }),
    );
    return [...own, ...fieldErrorsFrom(error.children ?? [], field)];
  });

// The global pipe: same 400 body as Nest's default, plus `fields`.
export class FieldValidationPipe extends ValidationPipe {
  constructor() {
    super({
      exceptionFactory: (errors) =>
        new BadRequestException({
          statusCode: 400,
          error: 'Bad Request',
          message: this.flattenValidationErrors(errors),
          fields: fieldErrorsFrom(errors),
        }),
    });
  }
}

export const fieldConflict = (fields: FieldErrorDto[]): HttpException =>
  new ConflictException({
    statusCode: 409,
    error: 'Conflict',
    message: fields.map((f) => f.message).join(' '),
    fields,
  });
