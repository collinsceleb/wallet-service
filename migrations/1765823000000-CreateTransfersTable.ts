import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTransfersTable1765823000000 implements MigrationInterface {
  name = 'CreateTransfersTable1765823000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "transfers" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "idempotency_key" character varying, "debit_id" uuid, "credit_id" uuid, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_transfers_idempotency_key" UNIQUE ("idempotency_key"), CONSTRAINT "PK_transfers_id" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "transfers"`);
  }
}
