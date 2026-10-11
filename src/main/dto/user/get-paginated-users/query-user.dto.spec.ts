import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { QueryUserDto } from './query-user.dto';
import {
  OrderByUser,
  OrderUser,
} from 'src/domain/usecases/user/get-all-users/get-paginated-users';

describe('QueryUserDto', () => {
  const pipe = new ValidationPipe({ transform: true });
  const parse = (query: Record<string, string>) =>
    pipe.transform(query, { type: 'query', metatype: QueryUserDto });

  it('defaults to the first page of 10, newest first', async () => {
    const query = await parse({});

    expect(query.page).toBe(1);
    expect(query.take).toBe(10);
    expect(query.orderBy).toBe(OrderByUser.CreatedAt);
    expect(query.order).toBe(OrderUser.Desc);
  });

  it('turns query strings into numbers', async () => {
    const query = await parse({ page: '3', take: '25' });

    expect(query.page).toBe(3);
    expect(query.take).toBe(25);
  });

  it.each([{ page: '0' }, { take: '0' }, { take: '101' }])(
    'rejects %p with a 400',
    async (bad) => {
      await expect(parse(bad)).rejects.toBeInstanceOf(BadRequestException);
    },
  );
});
