import { ConflictException } from '@nestjs/common';
import { AddUserDto } from 'src/main/dto/user/add-user/add-user.dto';
import { UserService } from './user.service';

const signUp = {
  email: 'ana@example.com',
  username: 'ana',
  password: 'segredo1',
  phoneNumber: '+5592999990000',
  profile: {
    programmingLanguage: 'Python',
    knowledge: 'NOVICE',
    interests: ['LOOPS'],
  },
} as unknown as AddUserDto;

const build = (taken: {
  email?: boolean;
  username?: boolean;
  phone?: boolean;
}) => {
  const exist = {
    existUserWithEmail: jest.fn().mockResolvedValue(!!taken.email),
    existUserWithUsername: jest.fn().mockResolvedValue(!!taken.username),
    existUserWithPhoneNumber: jest.fn().mockResolvedValue(!!taken.phone),
  };
  const add = { add: jest.fn().mockImplementation(async (user) => user) };
  const encrypter = { encrypt: jest.fn().mockResolvedValue('hash') };
  const service = new UserService(
    null as any,
    null as any,
    add as any,
    null as any,
    null as any,
    exist as any,
    encrypter as any,
  );
  return { service, add };
};

const conflictOf = async (promise: Promise<unknown>) => {
  try {
    await promise;
  } catch (err) {
    expect(err).toBeInstanceOf(ConflictException);
    return (err as ConflictException).getResponse() as any;
  }
  throw new Error('expected a 409');
};

describe('UserService.createUser', () => {
  it('names every taken field in one 409', async () => {
    const { service, add } = build({
      email: true,
      username: true,
      phone: true,
    });

    const body = await conflictOf(service.createUser(signUp));

    expect(body.fields).toEqual([
      { field: 'email', message: 'Este email já está em uso.' },
      { field: 'username', message: 'Este nome de usuário já está em uso.' },
      { field: 'phoneNumber', message: 'Este celular já está em uso.' },
    ]);
    expect(add.add).not.toHaveBeenCalled();
  });

  it('names only the field that is taken', async () => {
    const { service } = build({ username: true });

    const body = await conflictOf(service.createUser(signUp));

    expect(body.fields).toEqual([
      { field: 'username', message: 'Este nome de usuário já está em uso.' },
    ]);
  });

  it('creates the user with a hashed password when nothing is taken', async () => {
    const { service, add } = build({});

    await service.createUser(signUp);

    expect(add.add).toHaveBeenCalledWith(
      expect.objectContaining({ email: 'ana@example.com', password: 'hash' }),
    );
  });
});
