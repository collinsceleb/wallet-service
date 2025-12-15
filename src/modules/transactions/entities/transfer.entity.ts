import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('transfers')
export class Transfer {
  @PrimaryGeneratedColumn('uuid', {
    name: 'id',
    primaryKeyConstraintName: 'PK_transfers_id',
  })
  id: string;

  @Column({
    name: 'idempotency_key',
    type: 'varchar',
    unique: true,
    nullable: true,
  })
  idempotencyKey?: string;

  @Column({ name: 'debit_id', type: 'uuid', nullable: true })
  debitId?: string;

  @Column({ name: 'credit_id', type: 'uuid', nullable: true })
  creditId?: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
