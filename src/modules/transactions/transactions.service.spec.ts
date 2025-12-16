import { TransactionsService } from './transactions.service';
import { BadRequestException } from '@nestjs/common';

describe('TransactionsService (unit)', () => {
  const fakeDataSource: any = {};
  const svc = new TransactionsService(fakeDataSource);

  it('validateTransferRequest throws on non-positive amount', () => {
    expect(() => (svc as any).validateTransferRequest(0, 'a', 'b')).toThrow(
      BadRequestException,
    );
  });

  it('validateTransferRequest throws when sender and receiver are same', () => {
    expect(() =>
      (svc as any).validateTransferRequest(10, 'same', 'same'),
    ).toThrow(BadRequestException);
  });
});
