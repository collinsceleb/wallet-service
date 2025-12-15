import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Wallet } from './entities/wallet.entity';
import { Repository } from 'typeorm';
import { Transaction } from '../transactions/entities/transaction.entity';

@Injectable()
export class WalletsService {
  constructor(
    @InjectRepository(Wallet)
    private readonly walletRepository: Repository<Wallet>,
  ) {}

  create(createWalletDto: CreateWalletDto) {
    try {
      const wallet = this.walletRepository.create(createWalletDto);
      return this.walletRepository.save(wallet);
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to create wallet',
        error.message,
      );
    }
  }

  async getWalletDetails(id: string, page?: string, limit?: string) {
    try {
      const pageNum = Math.max(1, Number(page) || 1);
      const limitNum = Math.min(100, Math.max(1, Number(limit) || 20));
      const offset = (pageNum - 1) * limitNum;

      const existingWallet = await this.walletRepository.findOne({ where: { id } });
      if (!existingWallet) throw new NotFoundException('Wallet not found');

      const transactionRepository = this.walletRepository.manager.getRepository(Transaction);
      const [transactions, total] = await transactionRepository
        .createQueryBuilder('transaction')
        .where('transaction.wallet_id = :id', { id })
        .orderBy('transaction.created_at', 'DESC')
        .skip(offset)
        .take(limitNum)
        .getManyAndCount();

      return {
        wallet: {
          id: existingWallet.id,
          currency: existingWallet.currency,
          balance: existingWallet.balance,
          createdAt: existingWallet.createdAt,
          updatedAt: existingWallet.updatedAt,
        },
        transactions,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
        },
      };
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to fetch wallet',
        error.message,
      );
    }
  }
}
