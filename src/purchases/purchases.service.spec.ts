import { PurchasesService } from './purchases.service';

const makeSut = () => {
  const prisma = {
    purchase: {
      create: jest.fn().mockResolvedValue({}),
      findMany: jest.fn().mockResolvedValue([]),
    },
  };
  const sut = new PurchasesService(prisma as any);
  return { sut, prisma };
};

describe('PurchasesService', () => {
  it('records the purchase for the caller', async () => {
    const { sut, prisma } = makeSut();

    await sut.create(42, { itemId: 3 });

    expect(prisma.purchase.create).toHaveBeenCalledWith({
      data: { userId: 42, itemId: 3 },
    });
  });

  it("only returns the caller's assets", async () => {
    const { sut, prisma } = makeSut();

    await sut.findMyAssets(42);

    expect(prisma.purchase.findMany).toHaveBeenCalledTimes(3);
    for (const [query] of prisma.purchase.findMany.mock.calls) {
      expect(query.where.userId).toBe(42);
    }
  });
});
