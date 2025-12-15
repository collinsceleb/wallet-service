import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('wallets')
export class Wallet {
    @PrimaryGeneratedColumn('uuid', {
        name: 'id',
        primaryKeyConstraintName: 'PK_wallet_id',
    })
    id: string;

    @Column({
        name: 'currency',
        type: 'varchar',
        default: 'USD',
    })
    currency: string;

    @Column('decimal', {
        name: 'balance',
        precision: 12,
        scale: 2,
        default: 0,
        transformer: {
            to: (value: number) => value,
            from: (value: string) => parseFloat(value)
        }
    })
    balance: number;

    @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
    updatedAt: Date;
}
