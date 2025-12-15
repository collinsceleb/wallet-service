import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTransferIdToTransactions1765825000000 implements MigrationInterface {
  name = 'AddTransferIdToTransactions1765825000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "transactions" ADD COLUMN "transfer_id" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "transactions" ADD CONSTRAINT "FK_transactions_transfer_id" FOREIGN KEY ("transfer_id") REFERENCES "transfers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "transactions" DROP CONSTRAINT "FK_transactions_transfer_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "transactions" DROP COLUMN "transfer_id"`,
    );
  }
}
