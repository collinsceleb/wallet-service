import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { DataSource } from 'typeorm';
import { Wallet } from '../wallets/entities/wallet.entity';
import { Transaction } from './entities/transaction.entity';

@Injectable()
export class TransactionsService {
  constructor(private readonly dataSource: DataSource) {}
  async fundWallet(createTransactionDto: CreateTransactionDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();
      const { amount, walletId, type, idempotencyKey } =
        createTransactionDto;
      if (typeof amount !== 'number' || amount <= 0) {
        throw new BadRequestException('Amount must be a positive number');
      }
      const existingWallet = await queryRunner.manager
        .createQueryBuilder(Wallet, 'wallet')
        .setLock('pessimistic_write')
        .where('wallet.id = :id', { id: walletId })
        .getOne();
      if (!existingWallet) {
        throw new NotFoundException('Wallet not found');
      }
      if (idempotencyKey) {
        const existingTransaction = await queryRunner.manager
          .createQueryBuilder(Transaction, 'tx')
          .where('tx.idempotency_key = :key', { key: idempotencyKey })
          .andWhere('tx.wallet_id = :walletId', { walletId: walletId })
          .getOne();
        if (existingTransaction) {
          await queryRunner.commitTransaction();
          const freshWallet = await this.dataSource
            .getRepository(Wallet)
            .findOne({ where: { id: walletId } });
          return { transaction: existingTransaction, wallet: freshWallet };
        }
      }

      const newTransaction = queryRunner.manager.create(Transaction, {
        transactionType: type,
        balance: amount,
        wallet: existingWallet,
        idempotencyKey: idempotencyKey,
      });

      try {
        const savedTransaction = await queryRunner.manager.save(newTransaction);
        existingWallet.balance += amount;
        const savedWallet = await queryRunner.manager.save(existingWallet);
        await queryRunner.commitTransaction();
        return { transaction: savedTransaction, wallet: savedWallet };
      } catch (err: any) {
        if (err?.code === '23505' && idempotencyKey) {
          await queryRunner.rollbackTransaction();
          const existingTransaction = await this.dataSource
            .getRepository(Transaction)
            .createQueryBuilder('tx')
            .where('tx.idempotency_key = :key', { key: idempotencyKey })
            .andWhere('tx.wallet_id = :walletId', { walletId: walletId })
            .getOne();
          const freshWallet = await this.dataSource
            .getRepository(Wallet)
            .findOne({ where: { id: walletId } });
          return { transaction: existingTransaction, wallet: freshWallet };
        }
        throw err;
      }
    } catch (error) {
      if (queryRunner.isTransactionActive) {
        await queryRunner.rollbackTransaction();
      }
      throw new InternalServerErrorException(
        'Failed to fund wallet',
        error?.message,
      );
    } finally {
      await queryRunner.release();
    }
  }

  findAll() {
    return `This action returns all transactions`;
  }

  findOne(id: number) {
    return `This action returns a #${id} transaction`;
  }

  update(id: number, updateTransactionDto: UpdateTransactionDto) {
    return `This action updates a #${id} transaction`;
  }

  remove(id: number) {
    return `This action removes a #${id} transaction`;
  }
}
