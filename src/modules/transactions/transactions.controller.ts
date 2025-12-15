import {
  Controller,
  Post,
  Body,
  Headers,
  BadRequestException,
} from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { TransferTransactionDto } from './dto/transfer-transaction.dto';

@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post('fund-wallet')
  async fundWallet(
    @Body() createTransactionDto: CreateTransactionDto,
    @Headers('idempotency-key') idempotencyKey?: string,
  ) {
    if (idempotencyKey) {
      const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(idempotencyKey)) {
        throw new BadRequestException(
          'Invalid Idempotency-Key header; must be a UUID',
        );
      }
      if (!createTransactionDto.idempotencyKey) {
        (createTransactionDto as any).idempotencyKey = idempotencyKey;
      }
    }
    return await this.transactionsService.fundWallet(
      createTransactionDto as any,
    );
  }

  @Post('transfer-funds')
  async transferFunds(
    @Body() transferDto: TransferTransactionDto,
    @Headers('idempotency-key') idempotencyKey?: string,
  ) {
    if (idempotencyKey) {
      const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(idempotencyKey)) {
        throw new BadRequestException(
          'Invalid Idempotency-Key header; must be a UUID',
        );
      }
      if (!transferDto.idempotencyKey) {
        (transferDto as any).idempotencyKey = idempotencyKey;
      }
    }
    return await this.transactionsService.transferFunds(transferDto);
  }
}
