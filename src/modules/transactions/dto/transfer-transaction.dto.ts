import { IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';

export class TransferTransactionDto {
  @IsNotEmpty()
  @IsString()
  senderWalletId: string;

  @IsNotEmpty()
  @IsString()
  receiverWalletId: string;

  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @IsOptional()
  @IsString()
  @IsUUID()
  idempotencyKey?: string;
}
