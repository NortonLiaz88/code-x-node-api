import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';
import { CoursesController } from 'src/courses/courses.controller';
import { ProgressController } from 'src/progress/progress.controller';
import { GetUsersContoller } from 'src/presentation/controllers/user/get-users/get-user.controller';
import { UpdateUserController } from 'src/presentation/controllers/user/update-user/update-user.controller';
import { DeleteUserController } from 'src/presentation/controllers/user/delete-user/delete-user.controller';

// Builds the context Nest would pass for a request to controller.method.
const contextFor = (controller: any, method: string, role?: string) =>
  ({
    getHandler: () => controller.prototype[method],
    getClass: () => controller,
    switchToHttp: () => ({
      getRequest: () => ({ user: role ? { payload: { role } } : undefined }),
    }),
  }) as unknown as ExecutionContext;

const adminRoutes: [any, string][] = [
  [GetUsersContoller, 'handle'],
  [GetUsersContoller, 'findUser'],
  [UpdateUserController, 'update'],
  [DeleteUserController, 'delete'],
  [CoursesController, 'create'],
  [CoursesController, 'update'],
  [CoursesController, 'remove'],
  [ProgressController, 'create'],
  [ProgressController, 'findAll'],
  [ProgressController, 'findOne'],
  [ProgressController, 'update'],
  [ProgressController, 'remove'],
];

const studentRoutes: [any, string][] = [
  [CoursesController, 'findActiveUserCourses'],
  [ProgressController, 'getActivityMonthCalendar'],
];

describe('RolesGuard', () => {
  const guard = new RolesGuard(new Reflector());

  it.each(adminRoutes)(
    'returns 403 for a student on %p.%s',
    (controller, method) => {
      expect(() =>
        guard.canActivate(contextFor(controller, method, 'STUDENT')),
      ).toThrow(ForbiddenException);
    },
  );

  it.each(adminRoutes)('lets an admin call %p.%s', (controller, method) => {
    expect(guard.canActivate(contextFor(controller, method, 'ADMIN'))).toBe(
      true,
    );
  });

  it('returns 403 on an admin route when the token has no role', () => {
    expect(() =>
      guard.canActivate(contextFor(DeleteUserController, 'delete')),
    ).toThrow(ForbiddenException);
  });

  it.each(studentRoutes)('lets a student call %p.%s', (controller, method) => {
    expect(guard.canActivate(contextFor(controller, method, 'STUDENT'))).toBe(
      true,
    );
  });
});
