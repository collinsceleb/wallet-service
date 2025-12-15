import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { DataSource } from 'typeorm';
import { Wallet } from '../wallets/entities/wallet.entity';
import { Transaction, TransactionType } from './entities/transaction.entity';
import { TransferTransactionDto } from './dto/transfer-transaction.dto';

@Injectable()
export class TransactionsService {
  constructor(private readonly dataSource: DataSource) {}
  async fundWallet(createTransactionDto: CreateTransactionDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();
      const { amount, walletId, idempotencyKey } = createTransactionDto;
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
        transactionType: TransactionType.FUND,
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

  async transferFunds(transferDto: TransferTransactionDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();
      const { amount, senderWalletId, receiverWalletId, idempotencyKey } =
        transferDto;

      this.validateTransferRequest(amount, senderWalletId, receiverWalletId);

      let reservedTransferId: string | undefined;
      if (idempotencyKey) {
        const idempotencyOutcome = await this.handleIdempotency(
          queryRunner,
          idempotencyKey,
          senderWalletId,
          receiverWalletId,
        );
        if (idempotencyOutcome && typeof idempotencyOutcome === 'object')
          return idempotencyOutcome;
        if (idempotencyOutcome && typeof idempotencyOutcome === 'string')
          reservedTransferId = idempotencyOutcome;
      }

      const { sender, receiver } = await this.fetchAndValidateWallets(
        queryRunner,
        senderWalletId,
        receiverWalletId,
        amount,
      );
      const result = await this.executeTransfer(
        queryRunner,
        sender,
        receiver,
        amount,
        reservedTransferId,
      );

      if (idempotencyKey) {
        if (reservedTransferId) {
          await queryRunner.query(
            `UPDATE transfers SET debit_id = $1, credit_id = $2 WHERE id = $3`,
            [result.debit.id, result.credit.id, reservedTransferId],
          );
        } else {
          await queryRunner.query(
            `UPDATE transfers SET debit_id = $1, credit_id = $2 WHERE idempotency_key = $3`,
            [result.debit.id, result.credit.id, idempotencyKey],
          );
        }
      }

      await queryRunner.commitTransaction();
      return result;
    } catch (error) {
      if (queryRunner.isTransactionActive) {
        await queryRunner.rollbackTransaction();
      }
      throw new InternalServerErrorException(
        'Failed to transfer funds',
        error?.message,
      );
    } finally {
      await queryRunner.release();
    }
  }

  private validateTransferRequest(
    amount: number,
    senderWalletId: string,
    receiverWalletId: string,
  ) {
    if (typeof amount !== 'number' || amount <= 0) {
      throw new BadRequestException('Amount must be a positive number');
    }
    if (senderWalletId === receiverWalletId) {
      throw new BadRequestException(
        'Sender and receiver wallets must be different',
      );
    }
  }

  private async handleIdempotency(
    queryRunner: any,
    idempotencyKey: string,
    senderWalletId: string,
    receiverWalletId: string,
  ) {
    try {
      const rows: any[] = await queryRunner.query(
        `INSERT INTO transfers (idempotency_key) VALUES ($1) RETURNING id`,
        [idempotencyKey],
      );
      return rows[0]?.id as string | undefined;
    } catch (err: any) {
      if (err?.code === '23505') {
        return await this.checkExistingTransfer(
          queryRunner,
          idempotencyKey,
          senderWalletId,
          receiverWalletId,
        );
      }
      throw err;
    }
  }

  private async checkExistingTransfer(
    queryRunner: any,
    idempotencyKey: string,
    senderWalletId: string,
    receiverWalletId: string,
  ) {
    for (let i = 0; i < 10; i++) {
      const rows: any[] = await queryRunner.query(
        `SELECT debit_id, credit_id FROM transfers WHERE idempotency_key = $1`,
        [idempotencyKey],
      );
      const record = rows[0];
      if (record?.debit_id && record?.credit_id) {
        const [debit, credit, sender, receiver] = await Promise.all([
          this.dataSource
            .getRepository(Transaction)
            .findOne({ where: { id: record.debit_id } }),
          this.dataSource
            .getRepository(Transaction)
            .findOne({ where: { id: record.credit_id } }),
          this.dataSource
            .getRepository(Wallet)
            .findOne({ where: { id: senderWalletId } }),
          this.dataSource
            .getRepository(Wallet)
            .findOne({ where: { id: receiverWalletId } }),
        ]);
        return { debit, credit, sender, receiver };
      }
      await new Promise((r) => setTimeout(r, 100));
    }
    throw new InternalServerErrorException('Transfer is already in progress');
  }

  private async fetchAndValidateWallets(
    queryRunner: any,
    senderWalletId: string,
    receiverWalletId: string,
    amount: number,
  ) {
    const ids = [senderWalletId, receiverWalletId].sort((a, b) =>
      a.localeCompare(b),
    );
    const wallets = await queryRunner.manager
      .createQueryBuilder(Wallet, 'wallet')
      .setLock('pessimistic_write')
      .where('wallet.id IN (:...ids)', { ids })
      .getMany();

    const sender = wallets.find(
      (wallet: Wallet) => wallet.id === senderWalletId,
    );
    const receiver = wallets.find(
      (wallet: Wallet) => wallet.id === receiverWalletId,
    );

    if (!sender) throw new NotFoundException('Sender wallet not found');
    if (!receiver) throw new NotFoundException('Receiver wallet not found');
    if (sender.balance < amount)
      throw new BadRequestException('Insufficient balance');

    return { sender, receiver };
  }

  private async executeTransfer(
    queryRunner: any,
    sender: Wallet,
    receiver: Wallet,
    amount: number,
    transferId?: string,
  ) {
    const debitTx = queryRunner.manager.create(Transaction, {
      transactionType: TransactionType.TRANSFER,
      balance: -amount,
      wallet: sender,
      transferId: transferId,
    });
    const creditTx = queryRunner.manager.create(Transaction, {
      transactionType: TransactionType.TRANSFER,
      balance: amount,
      wallet: receiver,
      transferId: transferId,
    });

    const [savedDebit, savedCredit] = await Promise.all([
      queryRunner.manager.save(debitTx),
      queryRunner.manager.save(creditTx),
    ]);

    sender.balance -= amount;
    receiver.balance += amount;

    const [savedSender, savedReceiver] = await Promise.all([
      queryRunner.manager.save(sender),
      queryRunner.manager.save(receiver),
    ]);

    return {
      debit: savedDebit,
      credit: savedCredit,
      sender: savedSender,
      receiver: savedReceiver,
    };
  }
}
