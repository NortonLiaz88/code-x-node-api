import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';

/** The caller's profile id, from the token the global AuthGuard verified. */
export const ProfileId = createParamDecorator(
  (_: unknown, context: ExecutionContext): number => {
    const request = context.switchToHttp().getRequest();
    const profileId = request.user?.payload?.profile?.id;
    if (profileId === undefined || profileId === null) {
      throw new UnauthorizedException();
    }
    return profileId;
  },
);
