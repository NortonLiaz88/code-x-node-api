import { UserPostgresRepository } from './user.repository';
import {
  OrderByUser,
  OrderUser,
} from 'src/domain/usecases/user/get-all-users/get-paginated-users';

describe('UserPostgresRepository.getPaginatedUsers', () => {
  const ordering = { orderBy: OrderByUser.CreatedAt, order: OrderUser.Desc };
  const user = (id: number, extra = {}) => ({
    id,
    name: null,
    password: 'hash',
    userCourse: [],
    ...extra,
  });

  const makeRepository = (users: any[]) => {
    const prisma = {
      user: {
        count: jest.fn().mockResolvedValue(users.length),
        findMany: jest.fn().mockResolvedValue(users),
      },
    };
    return { prisma, repository: new UserPostgresRepository(prisma as any) };
  };

  it('lists users with no name and no course when there is no search', async () => {
    const { prisma, repository } = makeRepository([user(1), user(2)]);

    const result = await repository.getPaginatedUsers(
      { page: 1, take: 10 },
      ordering,
    );

    expect(prisma.user.findMany.mock.calls[0][0].where).toEqual({});
    expect(prisma.user.count).toHaveBeenCalledWith({ where: {} });
    expect(result.data.map((u) => u.id)).toEqual([1, 2]);
    expect(result.data[0]).not.toHaveProperty('password');
    expect(result.meta).toEqual({
      total: 2,
      lastPage: 1,
      currentPage: 1,
      perPage: 10,
    });
  });

  it('searches name, username and email, and counts only the matches', async () => {
    const { prisma, repository } = makeRepository([user(1)]);

    await repository.getPaginatedUsers({ page: 2, take: 5 }, ordering, ' Ana ');

    const where = {
      OR: [
        { name: { contains: 'Ana', mode: 'insensitive' } },
        { username: { contains: 'Ana', mode: 'insensitive' } },
        { email: { contains: 'Ana', mode: 'insensitive' } },
      ],
    };
    const query = prisma.user.findMany.mock.calls[0][0];
    expect(query.where).toEqual(where);
    expect(query.skip).toBe(5);
    expect(query.take).toBe(5);
    expect(prisma.user.count).toHaveBeenCalledWith({ where });
  });
});
