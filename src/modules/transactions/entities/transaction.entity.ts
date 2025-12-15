import { Wallet } from '../../../modules/wallets/entities/wallet.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  RelationId,
  UpdateDateColumn,
} from 'typeorm';

export enum TransactionType {
  FUND = 'deposit',
  TRANSFER = 'transfer',
}

@Index('UQ_transaction_wallet_idempotency', ['wallet', 'idempotencyKey'], {
  unique: true,
})
@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn('uuid', {
    name: 'id',
    primaryKeyConstraintName: 'PK_transaction_id',
  })
  id: string;

  @Column('decimal', {
    name: 'balance',
    precision: 12,
    scale: 2,
    default: 0,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => Number.parseFloat(value),
    },
  })
  balance: number;

  @Column({
    type: 'enum',
    enum: TransactionType,
    name: 'transaction_type',
  })
  transactionType: TransactionType;

  @ManyToOne(() => Wallet, (wallet) => wallet.transactions, { eager: true })
  @JoinColumn({
    name: 'wallet_id',
    foreignKeyConstraintName: 'FK_transaction_wallet_id',
  })
  wallet: Wallet;

  @RelationId((transaction: Transaction) => transaction.wallet)
  walletId: string;

  @Column({ name: 'idempotency_key', type: 'varchar', nullable: true })
  idempotencyKey?: string;

  @Column({ name: 'transfer_id', type: 'uuid', nullable: true })
  transferId?: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
