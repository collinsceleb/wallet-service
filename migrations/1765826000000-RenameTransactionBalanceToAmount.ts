import { MigrationInterface, QueryRunner } from 'typeorm';

export class RenameTransactionBalanceToAmount1765826000000 implements MigrationInterface {
  name = 'RenameTransactionBalanceToAmount1765826000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "transactions" RENAME COLUMN "balance" TO "amount"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "transactions" RENAME COLUMN "amount" TO "balance"`,
    );
  }
}
