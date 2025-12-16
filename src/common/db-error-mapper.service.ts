import { Injectable, HttpException, ConflictException } from '@nestjs/common';

@Injectable()
export class DbErrorMapperService {
  map(err: any): HttpException | null {
    if (!err) return null;
    const msg = String(err?.message || err).toLowerCase();
    if (msg.includes('current transaction is aborted')) {
      return new ConflictException(
        'A prior database error aborted this transaction due to transaction duplication — please retry the request',
      );
    }
    return null;
  }
}
