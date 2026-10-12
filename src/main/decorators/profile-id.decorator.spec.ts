import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { ROUTE_ARGS_METADATA } from '@nestjs/common/constants';
import { ProfileId } from './profile-id.decorator';

// Nest stores the decorator's factory as route metadata; pull it out to call it.
const factoryOf = (decorator: () => ParameterDecorator) => {
  class Probe {
    handle(@decorator() _: unknown) {}
  }
  const args = Reflect.getMetadata(ROUTE_ARGS_METADATA, Probe, 'handle');
  return args[Object.keys(args)[0]].factory;
};

const contextWith = (user: unknown) =>
  ({
    switchToHttp: () => ({ getRequest: () => ({ user }) }),
  }) as ExecutionContext;

describe('ProfileId', () => {
  const profileId = factoryOf(ProfileId);

  it('reads the profile id from the verified token', () => {
    expect(
      profileId(undefined, contextWith({ payload: { profile: { id: 7 } } })),
    ).toBe(7);
  });

  it('refuses a request without one', () => {
    expect(() => profileId(undefined, contextWith(undefined))).toThrow(
      UnauthorizedException,
    );
  });
});
