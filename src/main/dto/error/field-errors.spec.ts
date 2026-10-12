import { BadRequestException } from '@nestjs/common';
import { UpdateProfileDto } from 'src/profile/dto/update-profile.dto';
import { FieldValidationPipe } from './field-errors';

const validateBody = async (body: object) => {
  try {
    await new FieldValidationPipe().transform(body, {
      type: 'body',
      metatype: UpdateProfileDto,
    });
    return null;
  } catch (err) {
    expect(err).toBeInstanceOf(BadRequestException);
    return (err as BadRequestException).getResponse() as Record<
      string,
      unknown
    >;
  }
};

describe('FieldValidationPipe', () => {
  it('lists each wrong field with a message for the app', async () => {
    const body = await validateBody({ email: 'nope', phoneNumber: '12' });

    expect(body.fields).toEqual([
      { field: 'email', message: 'Email inválido.' },
      {
        field: 'phoneNumber',
        message: 'O celular precisa ter de 8 a 15 dígitos.',
      },
    ]);
    // The old message list is still there for existing clients.
    expect(body.message).toEqual([
      'email must be an email',
      'O celular precisa ter de 8 a 15 dígitos.',
    ]);
  });

  it('lets a valid body through', async () => {
    expect(await validateBody({ username: 'ana.souza' })).toBeNull();
  });
});
