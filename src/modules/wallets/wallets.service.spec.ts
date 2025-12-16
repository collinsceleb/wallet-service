import { WalletsService } from './wallets.service';

describe('WalletsService', () => {
  it('returns wallet details with paginated transactions', async () => {
    const mockWallet = {
      id: 'wallet-1',
      currency: 'USD',
      balance: 1000,
      createdAt: new Date('2025-01-01'),
      updatedAt: new Date('2025-01-02'),
    } as any;

    const transactions = [
      { id: 'tx-1', amount: 100 },
      { id: 'tx-2', amount: -50 },
    ];

    const mockTransactionQB: any = {
      where: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn().mockResolvedValue([transactions, 2]),
    };

    const mockTransactionRepo = {
      createQueryBuilder: jest.fn().mockReturnValue(mockTransactionQB),
    };

    const mockWalletRepository: any = {
      findOne: jest.fn().mockResolvedValue(mockWallet),
      manager: {
        getRepository: jest.fn().mockReturnValue(mockTransactionRepo),
      },
    };

    const svc = new WalletsService(mockWalletRepository);

    const res = await svc.getWalletDetails('wallet-1', '1', '10');

    expect(res.wallet.id).toBe('wallet-1');
    expect(res.transactions).toHaveLength(2);
    expect(res.pagination.total).toBe(2);
    expect(mockTransactionRepo.createQueryBuilder).toHaveBeenCalled();
  });
});
