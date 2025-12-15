import { MigrationInterface, QueryRunner } from 'typeorm';

export class DropTransferIdempotencyIfExists1765824000000 implements MigrationInterface {
  name = 'DropTransferIdempotencyIfExists1765824000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "transfer_idempotency"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // no-op; original table is deprecated and intentionally not recreated
  }
}
